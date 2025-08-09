import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { Repository, DataSource } from 'typeorm';
import {
  AppointmentCategory,
  EnrollmentStatus,
  PartnerType,
  SourceStatus,
} from 'src/common/enums/enum';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Order } from 'src/order/entities/order.entity';
import { Consignment } from 'src/consignment/entities/consigment.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner) private partnerRepo: Repository<Partner>,
    private datasource: DataSource,
  ) {}

  async create(createPartnerDto: CreatePartnerDto) {
    // Check if email exist for this partner
    const isEmailExist = await this.partnerRepo.findOneBy({
      email: createPartnerDto.email,
      type: createPartnerDto.type,
    });

    if (isEmailExist)
      throw new ConflictException(`Email used for ${createPartnerDto.type}!`);

    const partner = this.partnerRepo.create(createPartnerDto);

    await this.partnerRepo.save(partner);

    return partner;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.partnerRepo
      .createQueryBuilder('partner')
      .orderBy('partner.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit, search } = paginationDto;

      if (search) {
        queryBuilder.where('LOWER(partner.fullName) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      const [partners, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { partners, total };
    } else {
      const partners = await queryBuilder.getMany();
      return partners;
    }
  }

  async findAllByType(type: PartnerType, paginationDto?: PaginationDto) {
    const queryBuilder = this.partnerRepo
      .createQueryBuilder('partner')
      .where('partner.type = :type', { type })
      .orderBy('partner.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit, search } = paginationDto;

      if (search) {
        queryBuilder.andWhere('LOWER(partner.fullName) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      const [partners, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { partners, total };
    } else {
      const partners = await queryBuilder.getMany();
      return partners;
    }
  }

  async findOne(id: number) {
    const partner = await this.partnerRepo.findOneBy({ id });
    if (!partner) throw new NotFoundException('Partner not found!');
    return partner;
  }

  async findCustomer(id: number) {
    const customer = await this.partnerRepo.findOneBy({
      id,
      type: PartnerType.CUSTOMER,
    });

    if (!customer) throw new NotFoundException('Customer not found!');
    return customer;
  }

  async findSupplier(id: number) {
    const supplier = await this.partnerRepo.findOneBy({
      id,
      type: PartnerType.SUPPLIER,
    });

    if (!supplier) throw new NotFoundException('Supplier not found!');
    return supplier;
  }

  async update(id: number, updatePartnerDto: UpdatePartnerDto) {
    const partner = await this.findOne(id);

    this.partnerRepo.merge(partner, updatePartnerDto);
    await this.partnerRepo.save(partner);

    return partner;
  }

  async remove(id: number) {
    const partner = await this.findOne(id);

    await this.partnerRepo.remove(partner);
    return { message: 'Delete partner success!' };
  }

  async getCustomerTherapyAppointment(customerId: number) {
    // Check if customer is existed
    await this.findCustomer(customerId);

    const appointments = await this.datasource
      .createQueryBuilder(Appointment, 'a')
      .leftJoinAndSelect('a.customer', 'customer')
      .where('customer.id = :customerId', { customerId })
      .getMany();

    return appointments;
  }

  async checkPartnerExist(partnerId: number, partnerType?: PartnerType) {
    const isPartnerExist = await this.partnerRepo.exists({
      where: {
        id: partnerId,
        type: partnerType,
      },
    });

    if (!isPartnerExist)
      throw new NotFoundException(`${partnerType} not exist hehe!`);
  }

  async getOrderByCustomer(
    customerId: number,
    cancelled: boolean,
    paginationDto?: PaginationDto,
  ) {
    await this.checkPartnerExist(customerId, PartnerType.CUSTOMER);

    const queryBuilder = this.datasource
      .createQueryBuilder(Order, 'o')
      .leftJoin('o.customer', 'customer')
      .where('customer.id = :customerId', { customerId })
      .addSelect('o.createdAt')
      .orderBy('o.createdAt', 'DESC');

    if (cancelled)
      queryBuilder.andWhere('o.status <> :cancel', {
        cancel: SourceStatus.CANCELLED,
      });

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [orders, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { orders, total };
    } else {
      const orders = await queryBuilder.getMany();
      return orders;
    }
  }

  async getEnrollmentByCustomer(
    customerId: number,
    withdrawned: boolean,
    paginationDto?: PaginationDto,
  ) {
    await this.checkPartnerExist(customerId, PartnerType.CUSTOMER);

    const queryBuilder = this.datasource
      .createQueryBuilder(Enrollment, 'e')
      .leftJoin('e.student', 'student')
      .leftJoin('e.course', 'course')
      .where('student.id = :studentId', { studentId: customerId })
      .addSelect([
        'e.createdAt',
        'student.id',
        'student.fullName',
        'course.name',
        'course.mode',
        'course.startDate',
      ])
      .orderBy('e.createdAt', 'DESC');

    if (withdrawned)
      queryBuilder.andWhere('e.status <> :withdrawned', {
        withdrawned: EnrollmentStatus.WITHDRAWN,
      });

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [orders, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { orders, total };
    } else {
      const orders = await queryBuilder.getMany();
      return orders;
    }
  }

  async getConsignmentByPartner(
    partnerId: number,
    cancelled: boolean,
    paginationDto: PaginationDto,
  ) {
    await this.checkPartnerExist(partnerId);

    const queryBuilder = this.datasource
      .createQueryBuilder(Consignment, 'c')
      .leftJoin('c.partner', 'partner')
      .where('partner.id = :partnerId', { partnerId });

    if (cancelled)
      queryBuilder.andWhere('c.status <> :cancel', {
        cancel: SourceStatus.CANCELLED,
      });

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [consignments, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { consignments, total };
    } else {
      const consignments = await queryBuilder.getMany();
      return consignments;
    }
  }

  async getPurchaseBySupplier(
    supplierId: number,
    cancelled: boolean,
    paginationDto?: PaginationDto,
  ) {
    await this.checkPartnerExist(supplierId, PartnerType.SUPPLIER);

    const queryBuilder = this.datasource
      .createQueryBuilder(Purchase, 'p')
      .leftJoin('p.supplier', 'supplier')
      .addSelect('p.createdAt')
      .where('supplier.id = :supplierId', { supplierId });

    if (cancelled)
      queryBuilder.andWhere('p.status <> :cancel', {
        cancel: SourceStatus.CANCELLED,
      });

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [purchases, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { purchases, total };
    } else {
      const purchases = await queryBuilder.getMany();
      return purchases;
    }
  }

  async getTransactionsByPartner(partnerId: number) {
    return this.datasource
      .createQueryBuilder(Transaction, 't')
      .where(
        `
        (t.sourceType = :orderType AND t.sourceId IN (
          SELECT o.id FROM \`order\` o WHERE o.customerId = :partnerId
        ))
        OR
        (t.sourceType = :consType AND t.sourceId IN (
          SELECT c.id FROM consignment c WHERE c.partnerId = :partnerId
        ))
        OR
        (t.sourceType = :purType AND t.sourceId IN (
          SELECT p.id FROM purchase p WHERE p.supplierId = :partnerId
        ))
      `,
        {
          orderType: 'Order',
          consType: 'Consignment',
          purType: 'Purchase',
          partnerId,
        },
      )
      .orderBy('t.createdAt', 'DESC')
      .getMany();
  }

  async findAppointmentByCustomer(
    customerId: number,
    category?: AppointmentCategory,
    paginationDto?: PaginationDto,
  ) {
    await this.checkPartnerExist(customerId, PartnerType.CUSTOMER);

    const queryBuilder = this.datasource
      .createQueryBuilder(Appointment, 'appointment')
      .leftJoinAndSelect('appointment.item', 'item')
      .leftJoinAndSelect('appointment.healer', 'healer')
      .leftJoinAndSelect('appointment.room', 'room')
      .leftJoinAndSelect('appointment.customer', 'customer')
      .select([
        'appointment.id',
        'appointment.note',
        'appointment.startAt',
        'appointment.endAt',
        'appointment.category',
        'appointment.createdAt',
        'appointment.duration',
        'appointment.status',
        'appointment.type',
        'item.id',
        'healer.fullName',
        'healer.id',
        'customer.fullName',
        'customer.id',
        'room.name',
        'room.id',
      ])
      .where('customer.id = :customerId', { customerId })
      .orderBy('appointment.createdAt', 'DESC');

    if (category)
      queryBuilder.andWhere('appointment.category = :category', { category });

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
}
