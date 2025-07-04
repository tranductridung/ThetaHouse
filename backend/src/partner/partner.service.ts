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
import { PartnerType, SourceStatus } from 'src/common/enums/enum';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Order } from 'src/order/entities/order.entity';
import { Consignment } from 'src/consignment/entities/consigment.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

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
      .orderBy('partner.id', 'ASC');

    if (paginationDto) {
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
      .orderBy('partner.id', 'ASC');

    if (paginationDto) {
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
      throw new NotFoundException(`${partnerType} not exist!`);
  }

  async getSourceOfPartner(partnerId: number, partnerType: PartnerType) {
    await this.checkPartnerExist(partnerId, partnerType);

    if (partnerType === PartnerType.CUSTOMER) {
      const consignments = await this.datasource
        .createQueryBuilder(Consignment, 'c')
        .leftJoin('c.partner', 'partner')
        .where('partner.id = :partnerId', { partnerId })
        .andWhere('c.status <> :cancel', { cancel: SourceStatus.CANCELLED })
        .getMany();

      const orders = await this.datasource
        .createQueryBuilder(Order, 'o')
        .leftJoin('o.customer', 'customer')
        .where('customer.id = :customerId', { customerId: partnerId })
        .andWhere('o.status <> :cancel', { cancel: SourceStatus.CANCELLED })
        .getMany();

      return { consignments, orders };
    } else {
      const consignments = await this.datasource
        .createQueryBuilder(Consignment, 'c')
        .leftJoin('c.partner', 'partner')
        .where('partner.id = :partnerId', { partnerId })
        .andWhere('c.status <> :cancel', { cancel: SourceStatus.CANCELLED })
        .getMany();

      const purchases = await this.datasource
        .createQueryBuilder(Purchase, 'p')
        .leftJoin('p.supplier', 'supplier')
        .where('supplier.id = :supplierId', { supplierId: partnerId })
        .andWhere('p.status <> :cancel', { cancel: SourceStatus.CANCELLED })
        .getMany();

      return { consignments, purchases };
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
}
