import { PaginationDto } from './../common/dtos/pagination.dto';
import { DataSource, Not } from 'typeorm';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentStatus,
  AppointmentType,
  ItemableType,
  ItemStatus,
  SourceType,
} from 'src/common/enums/enum';
import { Order } from 'src/order/entities/order.entity';
@Injectable()
export class AppointmentService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @Inject(forwardRef(() => ItemService))
    private itemService: ItemService,
    private modulesService: ModulesService,
    private roomService: RoomService,
    private userService: UserService,
    @Inject(forwardRef(() => PartnerService))
    private partnerService: PartnerService,
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
          },
        });

        const itemSession = Number(item.snapshotData.session) * item.quantity;
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
          Math.floor(mainSessionCompleted / Number(item.snapshotData.session)) *
          Number(item.snapshotData.bonusSession);

        if (bonusSessionCreated >= validBonusSession)
          throw new BadRequestException(
            'Completed all main session of service to use bonus session!',
          );
      }
    }
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const appointment = this.appointmentRepo.create(createAppointmentDto);

    // Get customerId
    if (createAppointmentDto.itemId) {
      // Get sourceId from Item
      const item = await this.dataSource
        .createQueryBuilder(Item, 'i')
        .select(['i.sourceId', 'sourceId', 'i.snapshotData', 'snapshotData'])
        .where('i.id = :itemId', { itemId: createAppointmentDto.itemId })
        .getRawOne<{ sourceId: number | null; snapshotData: any }>();

      if (!item?.sourceId) {
        throw new BadRequestException('Item not exist or lack of sourceId!');
      }

      const order = await this.dataSource
        .createQueryBuilder(Order, 'o')
        .leftJoinAndSelect('o.customer', 'customer')
        .where('o.id = :id', { id: item.sourceId })
        .getOne();

      if (!order?.customer?.id) {
        throw new BadRequestException(
          'Order not exist or order dont have customer ID!',
        );
      }

      createAppointmentDto.customerId = order.customer.id;

      appointment.duration = Number(item.snapshotData.duration);
    } else {
      if (!createAppointmentDto.customerId) {
        throw new BadRequestException('Customer ID is required!');
      }
    }

    // Get customer by customerId
    const customer = await this.partnerService.findCustomer(
      createAppointmentDto.customerId,
    );

    if (!customer) {
      throw new BadRequestException('Customer not exitst!');
    }

    appointment.customer = customer;
    // const customer = await this.partnerService.findCustomer(
    //   createAppointmentDto.customerId,
    // );
    // appointment.customer = customer;

    // Validate and create item (for bonus and main)
    if (createAppointmentDto.type !== AppointmentType.FREE) {
      // Check if itemId exists
      if (!createAppointmentDto.itemId)
        throw new BadRequestException(`ItemId is required!`);

      const item = await this.itemService.findOne(
        createAppointmentDto.itemId,
        true,
      );
      appointment.item = item;

      await this.validateSession(createAppointmentDto.type, undefined, item);
    } else {
      await this.validateSession(AppointmentType.FREE, customer, undefined);
    }

    // Calculate endAt from startAt and duration (if startAt exist)
    if (createAppointmentDto.startAt) {
      // If type = free, dto must contain duration
      if (
        createAppointmentDto.type === AppointmentType.FREE &&
        !createAppointmentDto.duration
      )
        throw new BadRequestException('Duration is required!');

      // const durationValue =
      //   createAppointmentDto.type === AppointmentType.FREE
      //     ? createAppointmentDto.duration
      //     : Number(appointment.item.snapshotData.duration);

      const endAt = this.calculteEndAt(
        createAppointmentDto.startAt,
        appointment.duration,
      );

      appointment.endAt = endAt;

      // Add healer
      if (createAppointmentDto.healerId) {
        appointment.healer = await this.isHealerFree(
          createAppointmentDto.startAt,
          endAt,
          createAppointmentDto.healerId,
        );
      }

      // Add room
      if (createAppointmentDto.roomId) {
        appointment.room = await this.isRoomFree(
          createAppointmentDto.startAt,
          endAt,
          createAppointmentDto.roomId,
        );
      }
    }

    // Add modules
    if (createAppointmentDto.moduleIds) {
      const modules = await this.modulesService.findByIds(
        createAppointmentDto.moduleIds,
      );

      appointment.modules = modules;
    }

    // Set status
    const isFullInfo = this.checkStatus(appointment);
    if (isFullInfo) appointment.status = AppointmentStatus.CONFIRMED;
    else appointment.status = AppointmentStatus.PENDING;

    await this.appointmentRepo.save(appointment);

    return appointment;
  }

  async isHealerFree(
    appoitmentStart: Date,
    appoitmentEnd: Date,
    healerId: number,
    oldAptId?: number,
  ) {
    const healer = await this.userService.findOne(healerId);

    console.log(appoitmentStart);
    console.log(appoitmentEnd);
    if (appoitmentStart > appoitmentEnd)
      // if (appoitmentStart >= appoitmentEnd)

      throw new BadRequestException('Start time cannot greater than end time!');

    // Get appointment which is conflict with date of new appointment
    const conflictAppointment = await this.appointmentRepo
      .createQueryBuilder('a')
      .where('a.healerId = :healerId', { healerId })
      .andWhere('a.id <> :oldAptId', { oldAptId })
      .andWhere(
        `
        NOT(
          (
        a.startAt >= :appoitmentEnd
        AND
          a.endAt >= :appoitmentEnd
        )
        OR
          (
        a.startAt <= :appoitmentStart
        AND
          a.endAt <= :appoitmentStart
          )
        )
        `,
        { appoitmentStart, appoitmentEnd },
      )
      .getOne();

    if (conflictAppointment) throw new BadRequestException('Healer busy!');
    return healer;
  }

  async isRoomFree(
    appoitmentStart: Date,
    appoitmentEnd: Date,
    roomId: number,
    oldAptId?: number,
  ) {
    const room = await this.roomService.findOne(roomId);

    if (appoitmentStart > appoitmentEnd)
      throw new BadRequestException('Start time cannot greater than end time!');

    // Get appointment which is conflict with date of new appointment
    const conflictRoom = await this.appointmentRepo
      .createQueryBuilder('a')
      .where('a.roomId = :roomId', { roomId })
      .andWhere('a.id <> :oldAptId', { oldAptId })
      .andWhere(
        `
        NOT(
        (
          a.startAt >= :appoitmentEnd
          AND
          a.endAt >= :appoitmentEnd
        )
        OR
        (
          a.startAt <= :appoitmentStart
          AND
          a.endAt <= :appoitmentStart  
        )
        )
        `,
        { appoitmentStart, appoitmentEnd },
      )
      .getOne();

    if (conflictRoom) throw new BadRequestException('Room busy!');
    return room;
  }

  async findOne(id: number, isActive?: boolean) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['room', 'healer', 'customer', 'item'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found!');

    if (isActive && appointment.status === AppointmentStatus.CANCELLED)
      throw new NotFoundException('Appointment is cancelled!');

    return appointment;
  }

  calculteEndAt(startAt: Date, duration: number) {
    const endAt = new Date(startAt.getTime() + duration * 60000);
    return endAt;
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    item?: Item,
  ) {
    const appointment = await this.findOne(id, true);
    const startAt = updateAppointmentDto.startAt ?? appointment.startAt;

    // Check and validate startAt
    if (!startAt) throw new BadRequestException('Start time is required!');

    const endAt = this.calculteEndAt(startAt, Number(appointment.duration));

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
      );
    }

    // Change owner
    if (updateAppointmentDto.customerId) {
      const customer = await this.partnerService.findOne(
        updateAppointmentDto.customerId,
      );
      if (customer.id !== appointment.customer.id) {
        if (!item)
          throw new BadRequestException('Item is required to change owner!');

        item.status = ItemStatus.TRANSFERED;
        appointment.customer = customer;
      }
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
    const appointment = await this.findOne(id);
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
    const requiredFields = ['startAt', 'endAt', 'healer', 'room', 'customer'];
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
      return appointments;
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
    console.log(itemId);

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

    console.log(mainCount, totalSession, bonusCount, totalBonusSession);

    return mainCount === totalSession && bonusCount === totalBonusSession;
  }
}
