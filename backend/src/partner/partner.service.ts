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
import { Repository } from 'typeorm';
import { PartnerType } from 'src/common/enums/enum';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner) private partnerRepo: Repository<Partner>,
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
}
