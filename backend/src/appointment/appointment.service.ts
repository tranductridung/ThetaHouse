/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Repository } from 'typeorm';
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
} from 'src/common/enums/enum';
@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
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
        where: { customer },
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
    // Add customer
    const customer = await this.partnerService.findCustomer(
      createAppointmentDto.customerId,
    );
    appointment.customer = customer;

    // Validate and create item (for bonus and main)
    if (createAppointmentDto.type !== AppointmentType.FREE) {
      // Check if itemId exists
      if (!createAppointmentDto.itemId)
        throw new BadRequestException(`ItemId is required!`);

      const item = await this.itemService.findOne(createAppointmentDto.itemId);
      appointment.item = item;

      await this.validateSession(createAppointmentDto.type, undefined, item);
    } else {
      await this.validateSession(AppointmentType.FREE, customer, undefined);
    }

    // Calculate endAt from startAt and duration (if startAt exist)
    if (createAppointmentDto.startAt) {
      if (!createAppointmentDto.duration)
        throw new BadRequestException('Duration is required!');

      const endAt = this.calculteEndAt(
        createAppointmentDto.startAt,
        createAppointmentDto.duration,
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
  ) {
    const healer = await this.userService.findOne(healerId);

    if (appoitmentStart >= appoitmentEnd)
      throw new BadRequestException('Start time cannot greater than end time!');

    // Get appointment which is conflict with date of new appointment
    const conflictAppointment = await this.appointmentRepo
      .createQueryBuilder('a')
      .where('a.healerId = :healerId', { healerId })
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

  async isRoomFree(appoitmentStart: Date, appoitmentEnd: Date, roomId: number) {
    const room = await this.roomService.findOne(roomId);

    if (appoitmentStart >= appoitmentEnd)
      throw new BadRequestException('Start time cannot greater than end time!');

    // Get appointment which is conflict with date of new appointment
    const conflictRoom = await this.appointmentRepo
      .createQueryBuilder('a')
      .where('a.roomId = :roomId', { roomId })
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

  async findOne(id: number) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['room', 'healer', 'customer', 'item'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found!');
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
    const appointment = await this.findOne(id);
    const startAt = updateAppointmentDto.startAt ?? appointment.startAt;

    // Check and validate startAt
    if (!startAt) throw new BadRequestException('Start time is required!');

    let endAt = appointment.endAt;

    // Calculate endAt if the update DTO has startAt or the appointment doesn't have endAt
    if (updateAppointmentDto.startAt || !endAt) {
      if (!updateAppointmentDto.duration)
        throw new BadRequestException('Required duration!');

      endAt = this.calculteEndAt(startAt, updateAppointmentDto.duration);
    }

    // Check if room free
    if (updateAppointmentDto.roomId) {
      appointment.room = await this.isRoomFree(
        startAt,
        endAt,
        updateAppointmentDto.roomId,
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

      if (customer !== appointment.customer) {
        if (!item) throw new BadRequestException('Please provide item!');

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
        if (!item) throw new BadRequestException('Please provide item!');
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

    await this.appointmentRepo.remove(appointment);
    return { message: 'Delete appointment success!' };
  }

  async setCompleteStatus(appointment: Appointment) {
    if (appointment.status === AppointmentStatus.PENDING)
      throw new BadRequestException(
        'Update full information to set status to completed!',
      );

    if (appointment.status === AppointmentStatus.COMPLETED)
      throw new BadRequestException('Appointment status is completed!');

    appointment.status = AppointmentStatus.COMPLETED;
    await this.appointmentRepo.save(appointment);
  }

  checkStatus(appointment: Appointment) {
    // Change status
    const requiredFields = ['startAt', 'endAt', 'healer', 'room', 'customer'];
    const allFieldsHaveValue = requiredFields.every(
      (key) => appointment[key] !== null && appointment[key] !== undefined,
    );
    return allFieldsHaveValue;
  }

  findAll() {
    return this.appointmentRepo.find();
  }

  async toggle() {
    const apts = await this.findAll();

    for (const apt of apts) {
      apt.status = AppointmentStatus.COMPLETED;
      await this.appointmentRepo.save(apt);
    }
  }
}
