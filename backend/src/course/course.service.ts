import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CommonStatus, CourseMode, CourseRole } from 'src/common/enums/enum';
import { CourseStaff } from './entities/course-staff.entity';
import { UserService } from 'src/user/user.service';
import { CreateCourseStaffDto } from './dto/create-course-staff.dto';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(CourseStaff)
    private courseStaffRepo: Repository<CourseStaff>,
    private userService: UserService,
    private dataSource: DataSource,
  ) {}

  // Service for course
  validateSession(
    mode: CourseMode,
    onlineSession?: number | null,
    offlineSession?: number | null,
  ) {
    switch (mode) {
      case CourseMode.COMBINE:
        if (!onlineSession)
          throw new BadRequestException('Online session required!');
        if (!offlineSession)
          throw new BadRequestException('Offline session required!');
        break;

      case CourseMode.ONLINE:
        if (!onlineSession)
          throw new BadRequestException('Online session required!');
        if (offlineSession)
          throw new BadRequestException('Offline session should not exist!');
        break;

      case CourseMode.OFFLINE:
        if (!offlineSession)
          throw new BadRequestException('Offline session required!');
        if (onlineSession)
          throw new BadRequestException('Online session should not exist!');
        break;
    }
  }

  async create(createCourseDto: CreateCourseDto) {
    this.validateSession(
      createCourseDto.mode,
      createCourseDto?.onlineSession ?? undefined,
      createCourseDto?.offlineSession ?? undefined,
    );

    if (createCourseDto.mode === CourseMode.OFFLINE) {
      if (createCourseDto.meetingLink)
        throw new BadRequestException('Meeting link should not exist!');

      if (createCourseDto.meetingPassword)
        throw new BadRequestException('Meeting password should not exist!');
    }
    const course = this.courseRepo.create(createCourseDto);
    await this.courseRepo.save(course);
    return course;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.courseRepo
      .createQueryBuilder('course')
      .orderBy('course.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [courses, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { courses, total };
    } else {
      const courses = await queryBuilder.getMany();
      return { courses };
    }
  }

  async getEnrollmentsByCourse(
    courseId: number,
    paginationDto?: PaginationDto,
  ) {
    await this.findOneFull(courseId, true);

    const queryBuilder = this.dataSource
      .createQueryBuilder(Enrollment, 'e')
      .leftJoin('e.course', 'course')
      .leftJoin('e.student', 'student')
      .addSelect([
        'student.fullName',
        'course.name',
        'course.mode',
        'course.startDate',
        'e.createdAt',
      ])
      .orderBy('e.createdAt', 'DESC');

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
      return { enrollments };
    }
  }

  async getCourseStaff(courseId?: number, paginationDto?: PaginationDto) {
    if (courseId) await this.findOne(courseId, true);

    const queryBuilder = this.courseStaffRepo
      .createQueryBuilder('cs')
      .leftJoin('cs.course', 'course')
      .leftJoin('cs.staff', 'staff')
      .addSelect([
        'staff.fullName',
        'staff.id',
        'course.name',
        'course.mode',
        'course.startDate',
        'cs.createdAt',
      ])
      .orderBy('cs.createdAt', 'DESC');

    if (courseId) queryBuilder.where('course.id = :courseId', { courseId });

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [courseStaffies, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { courseStaffies, total };
    } else {
      const courseStaffies = await queryBuilder.getMany();
      return { courseStaffies };
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.courseRepo
      .createQueryBuilder('course')
      .where('course.status = :status', { status: CommonStatus.ACTIVE })
      .orderBy('course.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [courses, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { courses, total };
    } else {
      const courses = await queryBuilder.getMany();
      return courses;
    }
  }

  async findOneFull(id: number, isActive?: boolean) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['enrollments', 'courseStaffs'],
    });

    if (!course) throw new NotFoundException('Course not found!');

    if (isActive && course.status === CommonStatus.DELETED)
      throw new NotFoundException('Course is deleted!');

    return course;
  }

  async findOne(id: number, isActive?: boolean) {
    const course = await this.courseRepo.findOne({
      where: { id },
    });

    if (!course) throw new NotFoundException('Course not found!');

    if (isActive && course.status === CommonStatus.DELETED)
      throw new NotFoundException('Course is deleted!');

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.findOneFull(id, true);

    const mode = updateCourseDto?.mode ?? course.mode;

    // Validate session in DTO
    this.validateSession(
      mode,
      updateCourseDto?.onlineSession,
      updateCourseDto?.offlineSession,
    );
    this.courseRepo.merge(course, updateCourseDto);

    if (mode !== CourseMode.COMBINE) {
      if (course.mode === CourseMode.OFFLINE) {
        // if (updateCourseDto.mode === CourseMode.OFFLINE) {
        //   if (updateCourseDto.meetingLink)
        //     throw new BadRequestException('Meeting link should not exist!');

        //   if (updateCourseDto.meetingPassword)
        //     throw new BadRequestException('Meeting password should not exist!');
        // }

        course.onlineSession = null;
        // course.meetingLink = undefined;
        // course.meetingPassword = undefined;
      } else course.offlineSession = null;
    }

    await this.courseRepo.save(course);
    return course;
  }

  async remove(id: number) {
    const course = await this.findOneFull(id);

    if (course.status === CommonStatus.DELETED)
      throw new BadRequestException('Course has been deleted!');

    course.status = CommonStatus.DELETED;
    await this.courseRepo.save(course);
    return { message: 'Delete course success!' };
  }

  async restore(id: number) {
    const course = await this.findOneFull(id);

    if (course.status !== CommonStatus.DELETED)
      throw new BadRequestException('Course has not been deleted!');

    course.status = CommonStatus.ACTIVE;
    await this.courseRepo.save(course);
    return { message: 'Restore course success!' };
  }

  async toggleStatus(id: number) {
    const course = await this.findOneFull(id, true);

    course.status =
      course.status === CommonStatus.ACTIVE
        ? CommonStatus.INACTIVE
        : CommonStatus.ACTIVE;

    await this.courseRepo.save(course);
    return { message: `Course is changed to ${course.status}` };
  }

  // Service for course staff
  async addStaff(createCourseStaffDto: CreateCourseStaffDto) {
    const isStaffExist = await this.courseStaffRepo.findOne({
      where: {
        staff: { id: createCourseStaffDto.staffId },
        course: { id: createCourseStaffDto.courseId },
      },
    });

    if (isStaffExist)
      throw new BadRequestException('Staff is added to the course!');

    const staff = await this.userService.findOne(createCourseStaffDto.staffId);
    const course = await this.findOneFull(createCourseStaffDto.courseId, true);

    const courseStaff = this.courseStaffRepo.create({
      role: createCourseStaffDto.role,
    });

    courseStaff.course = course;
    courseStaff.staff = staff;

    await this.courseStaffRepo.save(courseStaff);
    return courseStaff;
  }

  async removeStaff(staffId: number, courseId: number) {
    await this.findOne(courseId, true);

    const staff = await this.courseStaffRepo.findOne({
      where: {
        course: { id: courseId },
        staff: { id: staffId },
      },
    });

    if (!staff) throw new BadRequestException('Staff is not belong to course!');

    await this.courseStaffRepo.remove(staff);

    return { message: 'Delete staff of course success!' };
  }

  async changeRole(staffId: number, courseId: number, courseRole: CourseRole) {
    await this.findOneFull(courseId, true);

    const staff = await this.courseStaffRepo.findOne({
      where: {
        course: { id: courseId },
        staff: { id: staffId },
      },
    });

    if (!staff) throw new BadRequestException('Staff is not belong to course!');

    staff.role = courseRole;
    await this.courseStaffRepo.save(staff);

    return { message: `Role is set to ${courseRole}` };
  }
}
