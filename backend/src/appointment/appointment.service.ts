import { PaginationDto } from './../common/dtos/pagination.dto';
import { DataSource, Not } from 'typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { ItemService } from 'src/item/item.service';
import { Item } from 'src/item/entities/item.entity';
import { RoomService } from './../room/room.service';
import { Appointment } from './entities/appointment.entity';
import { PartnerService } from 'src/partner/partner.service';
import { ModulesService } from 'src/modules/modules.service';
import { Partner } from 'src/partner/entities/partner.entity';
import { CreateTherapyAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentCategory,
  AppointmentStatus,
  AppointmentType,
  ItemableType,
  ItemStatus,
  ResponseCalendarStatus,
  SourceType,
} from 'src/common/enums/enum';
import { CreateConsultationAppointmentDto } from './dto/create-consultation-appointment.dto';
import { UpdateConsultationAppointmentDto } from './dto/update-consultation-appointment.dto';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { CreateCalendarDto } from 'src/google-calendar/dtos/create-calendar.dto';
import { SnapshotType } from 'src/common/types/item.types';

@Injectable()
export class AppointmentService {
  constructor(
    private dataSource: DataSource,
    @Inject(forwardRef(() => ItemService))
    private itemService: ItemService,
    private roomService: RoomService,
    private userService: UserService,
    private modulesService: ModulesService,
    @Inject(forwardRef(() => PartnerService))
    private partnerService: PartnerService,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    private googleCalendarService: GoogleCalendarService,
  ) {}

  async countSessionOfItem(itemId: number, type: AppointmentType) {
    const item = await this.itemService.findOne(itemId);

    if (item.itemableType === ItemableType.PRODUCT)
      throw new BadRequestException('Cannot create appointment for product!');

    const sessionCount = await this.appointmentRepo.count({
      where: {
        item: {
          id: itemId,
        },
        type,
      },
    });

    return sessionCount;
  }

  async validateSession(
    type: AppointmentType,
    customer?: Partner,
    item?: Item,
  ) {
    // Check if free session for user is used
    if (type === AppointmentType.FREE) {
      if (!customer) throw new BadRequestException('Customer is required!');

      const freeSessionAppointment = await this.appointmentRepo.findOne({
        where: {
          customer: { id: customer.id },
          type: AppointmentType.FREE,
          status: Not(AppointmentStatus.CANCELLED),
        },
      });

      if (freeSessionAppointment)
        throw new BadRequestException(`Free session for customer is used!`);
    } else {
      if (!item) throw new BadRequestException('Item is required!');

      if (item.itemableType === ItemableType.PRODUCT)
        throw new BadRequestException('Cannot create appointment for product!');

      // Check if appointment for main session is valid
      if (type === AppointmentType.MAIN) {
        const createdMainSession = await this.appointmentRepo.count({
          where: {
            item: { id: item.id },
            type: AppointmentType.MAIN,
            status: Not(AppointmentStatus.CANCELLED),
          },
        });

        const itemSession =
          Number((item.snapshotData as SnapshotType).session) * item.quantity;
        if (createdMainSession >= itemSession)
          throw new BadRequestException(
            `Cannot create more than ${itemSession} main session for this service!`,
          );
      }
      // Check if appointment for bonus session is valid
      else {
        if (item.status === ItemStatus.TRANSFERED)
          throw new BadRequestException(
            'Service owner is transfered. Cannot create more bonus session!',
          );

        const mainSessionCompleted = await this.appointmentRepo.count({
          where: {
            item: { id: item.id },
            type: AppointmentType.MAIN,
            status: AppointmentStatus.COMPLETED,
          },
        });

        const bonusSessionCreated = await this.countSessionOfItem(
          item.id,
          AppointmentType.BONUS,
        );

        // Find the number of service is complete (completed main session)
        // by mainSessionCompleted/session
        // Multi with bonusSession to find the bonusSession can use
        const validBonusSession =
          Math.floor(
            mainSessionCompleted /
              Number((item.snapshotData as SnapshotType).session),
          ) * Number((item.snapshotData as SnapshotType).bonusSession);
        if (bonusSessionCreated >= validBonusSession)
          throw new BadRequestException(
            'Completed main session of service to use bonus session!',
          );
      }
    }
  }

  async createTherapyApt(
    createTherapyAppointmentDto: CreateTherapyAppointmentDto,
  ) {
    if (createTherapyAppointmentDto.type === AppointmentType.FREE) {
      if (!createTherapyAppointmentDto.customerId)
        throw new BadRequestException(
          'Customer ID is required for free appointment!',
        );
      if (createTherapyAppointmentDto.itemId)
        throw new BadRequestException(
          'Free appointment should not exist itemId!',
        );
    } else {
      if (!createTherapyAppointmentDto.itemId)
        throw new BadRequestException(
          'ItemId is required for non-free appointment!',
        );
      if (createTherapyAppointmentDto.customerId)
        throw new BadRequestException(
          'Customer ID should not be provided for main or bonus!',
        );
    }

    const appointment = this.appointmentRepo.create({
      ...createTherapyAppointmentDto,
      category: AppointmentCategory.THERAPY,
    });

    // Get customerId
    if (createTherapyAppointmentDto.itemId) {
      if (createTherapyAppointmentDto.customerId)
        throw new BadRequestException('Customer ID should not exist!');
      // Get sourceId from Item
      const item = await this.dataSource
        .createQueryBuilder(Item, 'i')
        .select([
          'sourceId',
          'snapshotData',
          'currentCustomerId',
          'i.sourceId',
          'i.snapshotData',
          'i.currentCustomerId',
        ])
        .where('i.id = :itemId', {
          itemId: createTherapyAppointmentDto.itemId,
        })
        .andWhere('i.itemableType = :itemableType', {
          itemableType: ItemableType.SERVICE,
        })
        .andWhere('i.isActive = :active', {
          active: true,
        })
        .getRawOne<{
          sourceId: number | null;
          snapshotData: any;
          currentCustomerId: number;
        }>();

      if (!item?.sourceId) {
        throw new BadRequestException('Item not exist or lack of sourceId!');
      }

      createTherapyAppointmentDto.customerId = item.currentCustomerId;

      appointment.duration = Number(
        (item.snapshotData as SnapshotType).duration,
      );
    } else {
      if (!createTherapyAppointmentDto.customerId) {
        throw new BadRequestException('Customer ID is required!');
      }
    }

    // Get customer by customerId
    const customer = await this.partnerService.findCustomer(
      createTherapyAppointmentDto.customerId,
    );

    if (!customer) throw new BadRequestException('Customer not exist!');

    appointment.customer = customer;

    // Validate and create item (for bonus and main)
    if (createTherapyAppointmentDto.type !== AppointmentType.FREE) {
      // Check if itemId exists
      if (!createTherapyAppointmentDto.itemId)
        throw new BadRequestException(`ItemId is required!`);

      const item = await this.itemService.findOne(
        createTherapyAppointmentDto.itemId,
        true,
      );
      appointment.item = item;

      await this.validateSession(
        createTherapyAppointmentDto.type,
        undefined,
        item,
      );
    } else {
      await this.validateSession(AppointmentType.FREE, customer, undefined);
    }

    /////////////check lại phần này
    // Calculate endAt from startAt and duration (if startAt exist)
    if (createTherapyAppointmentDto.startAt) {
      // If type = free, dto must contain duration
      if (
        createTherapyAppointmentDto.type === AppointmentType.FREE &&
        !createTherapyAppointmentDto.duration
      )
        throw new BadRequestException('Duration is required!');

      const endAt = this.calculateEndAt(
        createTherapyAppointmentDto.startAt,
        appointment.duration,
      );

      appointment.endAt = endAt;

      // Add healer
      if (createTherapyAppointmentDto.healerId) {
        appointment.healer = await this.isHealerFree(
          createTherapyAppointmentDto.startAt,
          endAt,
          createTherapyAppointmentDto.healerId,
        );
      }

      // Add room
      if (createTherapyAppointmentDto.roomId) {
        appointment.room = await this.isRoomFree(
          createTherapyAppointmentDto.startAt,
          endAt,
          createTherapyAppointmentDto.roomId,
        );
      }
    } else {
      if (createTherapyAppointmentDto.healerId) {
        appointment.healer = await this.userService.findOne(
          Number(createTherapyAppointmentDto.healerId),
        );
      }

      if (createTherapyAppointmentDto.roomId) {
        appointment.room = await this.roomService.findOne(
          Number(createTherapyAppointmentDto.roomId),
        );
      }
    }

    // Add modules
    if (createTherapyAppointmentDto.moduleIds) {
      const modules = await this.modulesService.findByIds(
        createTherapyAppointmentDto.moduleIds,
      );

      appointment.modules = modules;
    }

    // Set status
    const isFullInfo = this.checkStatus(appointment);
    if (isFullInfo) appointment.status = AppointmentStatus.CONFIRMED;
    else appointment.status = AppointmentStatus.PENDING;

    await this.appointmentRepo.save(appointment);

    const calendar = await this.createAppointmentCalendar(appointment);

    return {
      appointment,
      calendar,
    };
  }

  async createAppointmentCalendar(appointment: Appointment) {
    if (appointment.healer.id && appointment.startAt && appointment.endAt) {
      const { accessToken, refreshToken } =
        await this.googleCalendarService.getUserTokens(appointment.healer.id);

      if (!accessToken || !refreshToken) {
        return {
          status: ResponseCalendarStatus.NOT_CONNECTED,
          error: 'Google token missing. Please connect with google calendar!',
        };
      }

      try {
        const createCalendarDto: CreateCalendarDto = {
          userId: appointment.healer.id,
          summary: `${appointment.category} Appointment`,
          description: `Appointment with ${appointment.customer.fullName}`,
          startDateTime: appointment.startAt,
          endDateTime: appointment.endAt,
        };

        await this.googleCalendarService.createEvent(
          accessToken,
          refreshToken,
          createCalendarDto,
        );

        return {
          status: ResponseCalendarStatus.SUCCESS,
        };
      } catch (error) {
        console.log(error);
        return {
          status: ResponseCalendarStatus.FAILED,
          error: 'Failed to create calendar event!',
        };
      }
    } else
      // fallback khi dữ liệu appointment không đủ
      return {
        status: ResponseCalendarStatus.FAILED,
        error: 'Missing appointment data!',
      };
  }

  async createConsultationApt(
    createConsultationAppointmentDto: CreateConsultationAppointmentDto,
  ) {
    const appointment = this.appointmentRepo.create({
      ...createConsultationAppointmentDto,
      category: AppointmentCategory.CONSULTATION,
    });

    // Get customer by customerId
    appointment.customer = await this.partnerService.findCustomer(
      createConsultationAppointmentDto.customerId,
    );

    // Calculate endAt from startAt and duration
    const endAt = this.calculateEndAt(
      createConsultationAppointmentDto.startAt,
      createConsultationAppointmentDto.duration,
    );

    appointment.endAt = endAt;

    // Add healer
    appointment.healer = await this.isHealerFree(
      createConsultationAppointmentDto.startAt,
      endAt,
      createConsultationAppointmentDto.healerId,
    );

    // Set status
    const isFullInfo = this.checkStatus(appointment);
    if (isFullInfo) appointment.status = AppointmentStatus.CONFIRMED;
    else appointment.status = AppointmentStatus.PENDING;

    await this.appointmentRepo.save(appointment);

    const calendar = await this.createAppointmentCalendar(appointment);

    return {
      appointment,
      calendar,
    };
  }

  async updateConsultationApt(
    aptId: number,
    updateConsultationAppointmentDto: UpdateConsultationAppointmentDto,
  ) {
    const appointment = await this.findOneFull(
      aptId,
      AppointmentCategory.CONSULTATION,
      false,
    );

    this.appointmentRepo.merge(appointment, updateConsultationAppointmentDto);

    // Calculate endAt from startAt and duration
    if (
      updateConsultationAppointmentDto.startAt ||
      updateConsultationAppointmentDto.duration
    ) {
      appointment.endAt = this.calculateEndAt(
        appointment.startAt!,
        appointment.duration,
      );
    }

    // Add healer
    if (updateConsultationAppointmentDto.healerId) {
      appointment.healer = await this.isHealerFree(
        appointment.startAt!,
        appointment.endAt!,
        updateConsultationAppointmentDto.healerId,
        appointment.id,
      );
    }

    // Set status
    const isFullInfo = this.checkStatus(appointment);
    if (isFullInfo) appointment.status = AppointmentStatus.CONFIRMED;
    else appointment.status = AppointmentStatus.PENDING;

    await this.appointmentRepo.save(appointment);

    return appointment;
  }

  async isHealerFree(
    appointmentStart: Date,
    appointmentEnd: Date,
    healerId: number,
    oldAptId?: number,
  ) {
    const healer = await this.userService.findOne(healerId);

    if (appointmentStart > appointmentEnd)
      throw new BadRequestException('Start time cannot greater than end time!');

    const queryBuilder = this.appointmentRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.healer', 'healer')
      .where('healer.id = :healerId', { healerId })
      .andWhere('a.status <> :status', { status: AppointmentStatus.CANCELLED });

    if (oldAptId) queryBuilder.andWhere('a.id <> :oldAptId', { oldAptId });

    queryBuilder.andWhere(
      `
        NOT(
          (
            a.startAt >= :appointmentEnd
        AND
            a.endAt >= :appointmentEnd
        )
        OR
          (
            a.startAt <= :appointmentStart
        AND
            a.endAt <= :appointmentStart
          )
        )
        `,
      { appointmentStart, appointmentEnd },
    );

    const conflictAppointment = await queryBuilder.getOne();

    if (conflictAppointment) throw new BadRequestException('Healer busy!');
    return healer;
  }

  async isRoomFree(
    appointmentStart: Date,
    appointmentEnd: Date,
    roomId: number,
    oldAptId?: number,
  ) {
    const room = await this.roomService.findOne(roomId);

    if (appointmentStart > appointmentEnd)
      throw new BadRequestException('Start time cannot greater than end time!');

    // Get appointment which is conflict with date of new appointment
    const queryBuilder = this.appointmentRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.room', 'room')
      .where('room.id = :roomId', { roomId })
      .andWhere('a.status <> :status', { status: AppointmentStatus.CANCELLED });

    if (oldAptId) queryBuilder.andWhere('a.id <> :oldAptId', { oldAptId });

    queryBuilder.andWhere(
      `
        NOT(
        (
          a.startAt >= :appointmentEnd
          AND
          a.endAt >= :appointmentEnd
        )
        OR
        (
          a.startAt <= :appointmentStart
          AND
          a.endAt <= :appointmentStart  
        )
        )
        `,
      { appointmentStart, appointmentEnd },
    );
    const conflictRoom = await queryBuilder.getOne();

    if (conflictRoom) throw new BadRequestException('Room busy!');
    return room;
  }

  async findOneFull(
    id: number,
    category?: AppointmentCategory,
    isActive?: boolean,
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id, category },
      relations: ['room', 'healer', 'customer', 'item'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found!');

    if (isActive && appointment.status === AppointmentStatus.CANCELLED)
      throw new NotFoundException('Appointment is cancelled!');

    return appointment;
  }

  async findOne(
    id: number,
    category?: AppointmentCategory,
    isActive?: boolean,
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id, category },
    });

    if (!appointment) throw new NotFoundException('Appointment not found!');

    if (isActive && appointment.status === AppointmentStatus.CANCELLED)
      throw new NotFoundException('Appointment is cancelled!');

    return appointment;
  }

  calculateEndAt(startAt: Date, duration: number) {
    const endAt = new Date(startAt.getTime() + duration * 60000);
    return endAt;
  }

  // check lai
  async updateTherapyApt(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    item?: Item,
  ) {
    const appointment = await this.findOneFull(
      id,
      AppointmentCategory.THERAPY,
      false,
    );

    if (
      updateAppointmentDto.healerId &&
      appointment.status === AppointmentStatus.COMPLETED
    )
      throw new BadRequestException(
        'Cannot change healer for completed appointment!',
      );

    const startAt = updateAppointmentDto.startAt ?? appointment.startAt;

    // Check and validate startAt
    if (!startAt) throw new BadRequestException('Start time is required!');

    const endAt = this.calculateEndAt(startAt, Number(appointment.duration));

    // Check if room free
    if (updateAppointmentDto.roomId) {
      appointment.room = await this.isRoomFree(
        startAt,
        endAt,
        updateAppointmentDto.roomId,
        appointment.id,
      );
    }

    // Check if healer free
    if (updateAppointmentDto.healerId) {
      appointment.healer = await this.isHealerFree(
        startAt,
        endAt,
        updateAppointmentDto.healerId,
        appointment.id,
      );
    }

    // Change type of appointment
    if (
      updateAppointmentDto.type &&
      updateAppointmentDto.type !== appointment.type
    ) {
      if (updateAppointmentDto.type === AppointmentType.FREE) {
        await this.validateSession(
          AppointmentType.FREE,
          appointment.customer,
          undefined,
        );
      } else {
        if (!item)
          throw new BadRequestException('Item is required to update type!');
        await this.validateSession(updateAppointmentDto.type, undefined, item);
      }
      appointment.type = updateAppointmentDto.type;
    }

    // Add modules for appointment
    if (updateAppointmentDto.moduleIds) {
      const modules = await this.modulesService.findByIds(
        updateAppointmentDto.moduleIds,
      );

      appointment.modules = modules;
    }

    // Merge data for appointment
    this.appointmentRepo.merge(appointment, {
      ...updateAppointmentDto,
      endAt,
    });

    // Set status if information of appointment is enough
    const isFull = this.checkStatus(appointment);
    if (isFull) appointment.status = AppointmentStatus.CONFIRMED;

    await this.appointmentRepo.save(appointment);

    return appointment;
  }

  async remove(id: number) {
    const appointment = await this.findOne(id, undefined, true);

    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepo.save(appointment);
    return { message: 'Remove appointment success!' };
  }

  async setCompleteStatus(appointmentId: number) {
    const querryRunner = this.dataSource.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction();

    try {
      const appointment = await querryRunner.manager.findOne(Appointment, {
        where: { id: appointmentId, status: Not(AppointmentStatus.CANCELLED) },
        relations: ['item', 'healer'],
      });

      if (!appointment) throw new NotFoundException('Appointment not found!');
      if (appointment.status === AppointmentStatus.COMPLETED)
        throw new BadRequestException('Appointment status is completed!');

      if (!appointment.healer)
        throw new BadRequestException(
          'Healer is required to mark appointment as completed!',
        );

      appointment.status = AppointmentStatus.COMPLETED;
      await querryRunner.manager.save(appointment);

      if (appointment.item) {
        await this.itemService.updateSourceStatus(
          appointment.item.sourceId,
          SourceType.ORDER,
          querryRunner.manager,
        );
      }
      await querryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await querryRunner.rollbackTransaction();
      throw error;
    } finally {
      await querryRunner.release();
    }
    return { message: 'Appointment is set to completed!' };
  }

  checkStatus(appointment: Appointment) {
    // Change status
    const requiredFields =
      appointment.category === AppointmentCategory.THERAPY
        ? ['startAt', 'endAt', 'healer', 'room', 'customer']
        : ['startAt', 'endAt', 'healer', 'customer'];

    const allFieldsHaveValue = requiredFields.every(
      (key) => appointment[key] !== null && appointment[key] !== undefined,
    );
    return allFieldsHaveValue;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.item', 'item')
      .leftJoinAndSelect('appointment.healer', 'healer')
      .leftJoinAndSelect('appointment.room', 'room')
      .leftJoinAndSelect('appointment.customer', 'customer')
      .select([
        'appointment.id',
        'appointment.note',
        'appointment.startAt',
        'appointment.endAt',
        'appointment.createdAt',
        'appointment.status',
        'appointment.duration',
        'appointment.category',
        'appointment.type',
        'item.id',
        'healer.fullName',
        'healer.id',
        'customer.fullName',
        'customer.id',
        'room.name',
        'room.id',
      ])
      .orderBy('appointment.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [appointments, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { appointments, total };
    } else {
      const appointments = await queryBuilder.getMany();
      return { appointments };
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.item', 'item')
      .leftJoinAndSelect('appointment.healer', 'healer')
      .leftJoinAndSelect('appointment.room', 'room')
      .leftJoinAndSelect('appointment.customer', 'customer')
      .where('appointment.status != :status', {
        status: AppointmentStatus.CANCELLED,
      })
      .select([
        'appointment.id',
        'appointment.note',
        'appointment.startAt',
        'appointment.endAt',
        'appointment.status',
        'appointment.duration',
        'appointment.type',
        'appointment.createdAt',
        'appointment.category',
        'item.id',
        'healer.fullName',
        'customer.fullName',
        'room.name',
        'healer.id',
        'customer.id',
        'room.id',
      ])
      .orderBy('appointment.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [appointments, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { appointments, total };
    } else {
      const appointments = await queryBuilder.getMany();
      return appointments;
    }
  }

  async toggle() {
    const appointments = await this.appointmentRepo.find();

    for (const apt of appointments) {
      apt.status = AppointmentStatus.COMPLETED;
      await this.appointmentRepo.save(apt);
    }
  }

  async isServiceItemCompleted(
    itemId: number,
    session: number,
    bonusSession: number,
    quantity: number,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = manager
      ? manager.getRepository(Appointment)
      : this.appointmentRepo;
    const totalSession = quantity * session;
    const totalBonusSession = quantity * bonusSession;

    const mainCount = await repo.count({
      where: {
        item: { id: itemId },
        type: AppointmentType.MAIN,
        status: AppointmentStatus.COMPLETED,
      },
    });
    const bonusCount = await repo.count({
      where: {
        item: { id: itemId },
        type: AppointmentType.BONUS,
        status: AppointmentStatus.COMPLETED,
      },
    });

    return mainCount === totalSession && bonusCount === totalBonusSession;
  }
}
