import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Repository, DataSource, In, EntityManager } from 'typeorm';
import { CourseService } from 'src/course/course.service';
import { PartnerService } from 'src/partner/partner.service';
import { EnrollmentStatus, ItemableType } from 'src/common/enums/enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Item } from 'src/item/entities/item.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    private courseService: CourseService,
    private partnerService: PartnerService,
    private dataSource: DataSource,
  ) {}

  async countUsedSlotsOfCourse(courseId: number) {
    return await this.enrollmentRepo.count({
      where: {
        course: { id: courseId },
        status: In([EnrollmentStatus.ENROLLED, EnrollmentStatus.PENDING]),
      },
    });
  }

  // Check student is enrolled in course or not
  async checkIsStudentEnrolled(studentId: number, courseId: number) {
    const isEnrolled = await this.enrollmentRepo.exists({
      where: {
        student: { id: studentId },
        course: { id: courseId },
        status: In([EnrollmentStatus.PENDING, EnrollmentStatus.ENROLLED]),
      },
    });
    if (isEnrolled)
      throw new BadRequestException(
        'The student is already enrolled in this course!',
      );
  }

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Enrollment)
      : this.enrollmentRepo;

    // Check if course exist and get course
    const course = await this.courseService.findOne(
      createEnrollmentDto.courseId,
      true,
    );

    // Check if item exist and get item
    const item = manager
      ? await manager.findOne(Item, {
          where: {
            id: createEnrollmentDto.itemId,
            itemableType: ItemableType.COURSE,
            isActive: true,
          },
        })
      : await this.dataSource
          .createQueryBuilder(Item, 'i')
          .where('i.id = :id', { id: createEnrollmentDto.itemId })
          .andWhere('i.itemableType = :itemableType', {
            itemableType: ItemableType.COURSE,
          })
          .andWhere('i.isActive = :active', { active: true })
          .getOne();

    if (!item) throw new BadRequestException('Item not found!');

    // Check available slots
    const usedSlots = await this.countUsedSlotsOfCourse(
      createEnrollmentDto.courseId,
    );
    const availableSlots = course.maxStudent - usedSlots;

    if (availableSlots <= 0)
      throw new BadRequestException('No available slots left!');

    // Create enrollment
    const enrollment = repo.create(createEnrollmentDto);
    enrollment.course = course;
    enrollment.item = item;
    enrollment.status = EnrollmentStatus.PENDING;

    // Check student is enrolled in course or not
    if (createEnrollmentDto.studentId) {
      await this.checkIsStudentEnrolled(
        createEnrollmentDto.studentId,
        createEnrollmentDto.courseId,
      );

      enrollment.student = await this.partnerService.findCustomer(
        createEnrollmentDto.studentId,
      );

      enrollment.status = EnrollmentStatus.ENROLLED;
    }

    await repo.save(enrollment);
    return enrollment;
  }

  async createForItem(itemId: number, manager: EntityManager) {
    const repo = manager
      ? manager.getRepository(Enrollment)
      : this.enrollmentRepo;

    const item = await manager.findOne(Item, {
      where: {
        id: itemId,
        itemableType: ItemableType.COURSE,
        isActive: true,
      },
    });

    if (!item) throw new BadRequestException('Item not found!');

    const createdEnrollmentOfItem = await repo.count({
      where: {
        item: { id: itemId },
        status: In([EnrollmentStatus.PENDING, EnrollmentStatus.ENROLLED]),
      },
    });

    if (createdEnrollmentOfItem >= item.quantity)
      throw new BadRequestException(
        'All enrollments for this item have been used!',
      );

    const enrollments: Enrollment[] = [];

    for (let i = createdEnrollmentOfItem; i < item.quantity; i++) {
      const createEnrollmentDto: CreateEnrollmentDto = {
        note: '',
        courseId: item.itemableId,
        itemId: itemId,
      };
      const enrollment = await this.create(createEnrollmentDto, manager);

      enrollments.push(enrollment);
    }
    return enrollments;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoin('enrollment.student', 'student')
      .leftJoin('enrollment.course', 'course')
      .leftJoin('enrollment.item', 'item')
      .addSelect([
        'enrollment.createdAt',
        'student.id',
        'student.fullName',
        'course.name',
        'course.mode',
        'course.startDate',
      ])
      .orderBy('enrollment.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [enrollments, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { enrollments, total };
    } else {
      const enrollments = await queryBuilder.getMany();
      return enrollments;
    }
  }

  async findOne(id: number, isActive?: boolean) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id },
      relations: ['course', 'student'],
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found!');

    if (
      isActive &&
      ![EnrollmentStatus.ENROLLED, EnrollmentStatus.PENDING].includes(
        enrollment?.status,
      )
    )
      throw new BadRequestException(
        `Enrollment is ${enrollment.status.toLowerCase()}!`,
      );

    return enrollment;
  }

  async findOneByCourseAndStudent(
    courseId: number,
    studentId: number,
    isActive?: boolean,
  ) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        course: { id: courseId },
        student: { id: studentId },
      },
      relations: ['course', 'student'],
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found!');

    if (isActive && enrollment?.status !== EnrollmentStatus.ENROLLED)
      throw new BadRequestException(
        `Enrollment is ${enrollment.status.toLowerCase()}!`,
      );

    return enrollment;
  }

  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    const enrollment = await this.findOne(id, true);

    if (
      enrollment.student &&
      updateEnrollmentDto.studentId === enrollment.student.id
    )
      updateEnrollmentDto.studentId = undefined;

    if (updateEnrollmentDto.studentId) {
      await this.checkIsStudentEnrolled(
        updateEnrollmentDto.studentId,
        enrollment.course.id,
      );

      const student = await this.partnerService.findCustomer(
        updateEnrollmentDto.studentId,
      );
      enrollment.student = student;
    }

    this.enrollmentRepo.merge(enrollment, updateEnrollmentDto);

    if (enrollment.course && enrollment.student)
      enrollment.status = EnrollmentStatus.ENROLLED;

    await this.enrollmentRepo.save(enrollment);

    return enrollment;
  }

  async withdraw(id: number) {
    const enrollment = await this.findOne(id, true);

    enrollment.status = EnrollmentStatus.WITHDRAWN;
    await this.enrollmentRepo.save(enrollment);

    return { message: 'Enrollment is withdraw!' };
  }
}
