import { CommonStatus, DiscountType } from 'src/common/enums/enum';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { Not, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto) {
    const isCodeExist = await this.discountRepo.findOneBy({
      code: createDiscountDto.code,
    });

    if (isCodeExist)
      throw new BadRequestException(
        `Code ${createDiscountDto.code} already used!`,
      );

    if (createDiscountDto.type === DiscountType.PERCENTAGE) {
      if (createDiscountDto.value > 100)
        throw new BadRequestException('Percentage not greater than 100%');
    } else {
      if (createDiscountDto.maxDiscountAmount)
        if (createDiscountDto.maxDiscountAmount)
          throw new BadRequestException(
            "Discount type 'FIXED' does not support a maximum discount amount",
          );
    }

    const discount = this.discountRepo.create(createDiscountDto);
    await this.discountRepo.save(discount);
    return discount;
  }

  async getActiveDiscountValue(id: number) {
    const discount = await this.discountRepo.findOne({
      where: { id, status: CommonStatus.ACTIVE },
      select: ['maxDiscountAmount', 'minTotalValue', 'type', 'value'],
    });

    if (!discount) throw new NotFoundException('Discount not found!');

    return discount;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.discountRepo
      .createQueryBuilder('discount')
      .orderBy('discount.id', 'ASC');

    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [discounts, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { discounts, total };
    } else {
      const discounts = await queryBuilder.getMany();
      return discounts;
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.discountRepo
      .createQueryBuilder('discount')
      .where('discount.status = :status', { status: CommonStatus.ACTIVE })
      .orderBy('discount.id', 'ASC');

    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [discounts, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { discounts, total };
    } else {
      const discounts = await queryBuilder.getMany();
      return discounts;
    }
  }

  async findOne(id: number) {
    const discount = await this.discountRepo.findOneBy({ id });
    if (!discount) throw new NotFoundException('Discount not found!');
    return discount;
  }

  async update(id: number, updateDiscountDto: UpdateDiscountDto) {
    const isCodeExist = await this.discountRepo.findOneBy({
      id: Not(id),
      code: updateDiscountDto.code,
    });

    if (isCodeExist)
      throw new BadRequestException(
        `Code ${updateDiscountDto.code} already used!`,
      );

    const discount = await this.discountRepo.findOne({
      where: {
        id,
        status: Not(CommonStatus.DELETED),
      },
    });
    if (!discount) throw new NotFoundException('Discount not found!');

    this.discountRepo.merge(discount, updateDiscountDto);
    await this.discountRepo.save(discount);

    return discount;
  }

  async remove(id: number) {
    const discount = await this.findOne(id);

    if (discount.status === CommonStatus.DELETED)
      throw new BadRequestException('Discount has been deleted!');

    discount.status = CommonStatus.DELETED;
    await this.discountRepo.save(discount);
    return { message: 'Delete discount success!' };
  }

  async restore(id: number) {
    const discount = await this.findOne(id);

    if (discount.status !== CommonStatus.DELETED)
      throw new BadRequestException('Discount has not been deleted!');

    discount.status = CommonStatus.ACTIVE;
    await this.discountRepo.save(discount);
    return { message: 'Restore discount success!' };
  }

  async toggleStatus(id: number) {
    const discount = await this.discountRepo.findOne({
      where: {
        id,
        status: Not(CommonStatus.DELETED),
      },
    });

    if (!discount) throw new NotFoundException('Discount not found!');

    discount.status =
      discount.status === CommonStatus.ACTIVE
        ? CommonStatus.INACTIVE
        : CommonStatus.ACTIVE;

    await this.discountRepo.save(discount);
    return { message: `Discount is changed to ${discount.status}` };
  }
}
