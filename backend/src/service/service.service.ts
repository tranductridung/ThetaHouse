import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Not, Repository } from 'typeorm';
import { CommonStatus, ServiceType } from 'src/common/enums/enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service) private serviceRepo: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    console.log('create');
    // Session = 1 and bonusSession = 0 (with single service)
    // duration = 60 (with single service)
    if (createServiceDto.type === ServiceType.SINGLE) {
      if (createServiceDto.session !== 1)
        throw new BadRequestException('Session must be 1 when type is SINGLE');

      if (createServiceDto.bonusSession && createServiceDto.bonusSession !== 0)
        throw new BadRequestException(
          'Bonus session must be 0 when type is SINGLE',
        );
    } else {
      if (createServiceDto.duration !== 60)
        throw new BadRequestException('Duration must be 60 when type is COMBO');
    }

    const service = this.serviceRepo.create(createServiceDto);
    await this.serviceRepo.save(service);

    return service;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.serviceRepo
      .createQueryBuilder('service')
      .orderBy('service.id', 'ASC');

    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [services, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { services, total };
    } else {
      const services = await queryBuilder.getMany();
      return services;
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.serviceRepo
      .createQueryBuilder('service')
      .where('service.status  = :status', { status: CommonStatus.ACTIVE })
      .orderBy('service.id', 'ASC');
    if (paginationDto) {
      const { page, limit } = paginationDto;

      const [services, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { services, total };
    } else {
      const services = await queryBuilder.getMany();
      return services;
    }
  }

  async findOne(id: number) {
    console.log('findOne');
    const service = await this.serviceRepo.findOneBy({ id });
    if (!service) throw new NotFoundException('Service not found!');
    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    console.log('update');
    const service = await this.serviceRepo.findOne({
      where: {
        id,
        status: Not(CommonStatus.DELETED),
      },
    });

    if (!service) throw new BadRequestException('Service not found!');

    // Session = 1 and bonusSession = 0 (with single service)
    // duration = 60 (with combo service)
    if (service.type === ServiceType.SINGLE) {
      if (updateServiceDto.session !== 1)
        throw new BadRequestException('Session must be 1 when type is SINGLE');

      if (updateServiceDto.bonusSession !== 0)
        throw new BadRequestException(
          'Bonus session must be 0 when type is SINGLE',
        );
    } else {
      if (updateServiceDto.duration !== 60)
        throw new BadRequestException('Duration must be 60 when type is COMBO');
    }

    this.serviceRepo.merge(service, updateServiceDto);
    await this.serviceRepo.save(service);

    return service;
  }

  async remove(id: number) {
    console.log('remove');
    const service = await this.findOne(id);

    if (service.status === CommonStatus.DELETED)
      throw new BadRequestException('Service has been deleted!');

    service.status = CommonStatus.DELETED;
    await this.serviceRepo.save(service);
    return { message: 'Delete service success!' };
  }

  async toggleStatus(id: number) {
    console.log('toggleStatus');
    const service = await this.serviceRepo.findOne({
      where: {
        id,
        status: Not(CommonStatus.DELETED),
      },
    });

    if (!service) throw new NotFoundException('Service not found!');

    service.status =
      service.status === CommonStatus.ACTIVE
        ? CommonStatus.INACTIVE
        : CommonStatus.ACTIVE;

    await this.serviceRepo.save(service);
    return { message: `Service is changed to ${service.status}` };
  }

  async restore(id: number) {
    console.log('restore');
    const service = await this.findOne(id);

    if (service.status !== CommonStatus.DELETED)
      throw new BadRequestException('Service has not been deleted!');

    service.status = CommonStatus.ACTIVE;
    await this.serviceRepo.save(service);
    return { message: 'Restore service success!' };
  }
}
