import { CommonStatus } from 'src/common/enums/enum';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepo.create(createProductDto);
    await this.productRepo.save(product);
    return product;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .orderBy('product.id', 'ASC');

    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [products, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { products, total };
    } else {
      const products = await queryBuilder.getMany();
      return products;
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .where('product.status = :status', { status: CommonStatus.ACTIVE });

    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [products, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { products, total };
    } else {
      const products = await queryBuilder.getMany();
      return products;
    }
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found!');
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepo.findOne({
      where: {
        id,
        status: Not(CommonStatus.DELETED),
      },
    });
    if (!product) throw new NotFoundException('Product not found!');

    this.productRepo.merge(product, updateProductDto);
    await this.productRepo.save(product);

    return product;
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (product.status === CommonStatus.DELETED)
      throw new BadRequestException('Product has been deleted!');

    product.status = CommonStatus.DELETED;
    await this.productRepo.save(product);
    return { message: 'Delete product success!' };
  }

  async restore(id: number) {
    const product = await this.findOne(id);

    if (product.status !== CommonStatus.DELETED)
      throw new BadRequestException('Product has not been deleted!');

    product.status = CommonStatus.ACTIVE;
    await this.productRepo.save(product);
    return { message: 'Restore product success!' };
  }

  async toggleStatus(id: number) {
    const product = await this.productRepo.findOne({
      where: {
        id,
        status: Not(CommonStatus.DELETED),
      },
    });

    if (!product) throw new NotFoundException('Product not found!');

    product.status =
      product.status === CommonStatus.ACTIVE
        ? CommonStatus.INACTIVE
        : CommonStatus.ACTIVE;

    await this.productRepo.save(product);
    return { message: `Product is changed to ${product.status}` };
  }

  async checkQuantity(
    id: number,
    quantityTarget: number,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Product) : this.productRepo;
    const product = await repo.findOneByOrFail({ id });

    return quantityTarget <= product.quantity;
  }
}
