import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Modules } from './entities/module.entity';
import { In, Not, Repository } from 'typeorm';
import { CommonStatus } from 'src/common/enums/enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Modules) private moduleRepo: Repository<Modules>,
  ) {}

  async create(createModuleDto: CreateModuleDto) {
    const isModuleExist = await this.moduleRepo.count({
      where: { name: createModuleDto.name },
    });

    if (isModuleExist)
      throw new BadRequestException('Module name already exist!');

    const module = this.moduleRepo.create(createModuleDto);
    await this.moduleRepo.save(module);

    return module;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.moduleRepo
      .createQueryBuilder('module')
      .orderBy('module.id', 'ASC');

    if (paginationDto) {
      const { page, limit, search } = paginationDto;

      if (search) {
        queryBuilder.where('LOWER(module.name) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      const [modules, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { modules, total };
    } else {
      const modules = await queryBuilder.getMany();
      return modules;
    }
  }

  async findAllActive(paginationDto?: PaginationDto) {
    const queryBuilder = this.moduleRepo
      .createQueryBuilder('module')
      .where('status = :status', { status: CommonStatus.ACTIVE })
      .orderBy('module.id', 'ASC');

    if (paginationDto) {
      const { page, limit, search } = paginationDto;

      if (search) {
        queryBuilder.andWhere('LOWER(module.name) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      const [modules, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { modules, total };
    } else {
      const modules = await queryBuilder.getMany();
      return modules;
    }
  }

  async findOne(id: number) {
    const module = await this.moduleRepo.findOneBy({ id });
    if (!module) throw new NotFoundException('Module not found!');
    return module;
  }

  async findOneActive(id: number) {
    const module = await this.moduleRepo.findOne({
      where: {
        id,
        status: CommonStatus.ACTIVE,
      },
    });
    if (!module) throw new NotFoundException('Module not found!');
    return module;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    // Check if module exist
    const module = await this.moduleRepo.findOne({
      where: {
        id,
        status: Not(CommonStatus.DELETED),
      },
    });

    if (!module) throw new NotFoundException('Module not found!');

    // Check name duplicate with other module
    if (updateModuleDto?.name) {
      const isNameExist = await this.moduleRepo.findOne({
        where: {
          id: Not(id),
          name: updateModuleDto.name,
        },
      });

      if (isNameExist)
        throw new BadRequestException('Module name already exist!');
    }

    // Update module
    this.moduleRepo.merge(module, updateModuleDto);
    await this.moduleRepo.save(module);

    return module;
  }

  async remove(id: number) {
    const module = await this.findOne(id);

    if (module.status === CommonStatus.DELETED)
      throw new BadRequestException('Module has been deleted!');

    module.status = CommonStatus.DELETED;
    await this.moduleRepo.save(module);

    return { message: 'Delete module success!' };
  }

  async toggleStatus(id: number) {
    const module = await this.moduleRepo.findOne({
      where: {
        id,
        status: Not(CommonStatus.DELETED),
      },
    });

    if (!module) throw new NotFoundException('Module not found!');

    module.status =
      module.status === CommonStatus.ACTIVE
        ? CommonStatus.INACTIVE
        : CommonStatus.ACTIVE;

    await this.moduleRepo.save(module);
    return { message: `Module is changed to ${module.status}` };
  }

  async restore(id: number) {
    const module = await this.findOne(id);

    if (module.status !== CommonStatus.DELETED)
      throw new BadRequestException('Module has not been deleted!');

    module.status = CommonStatus.ACTIVE;
    await this.moduleRepo.save(module);
    return { message: 'Restore module success!' };
  }

  async findByIds(moduleIds: number[]) {
    // async findByIds(moduleIds: number[], type: ServiceType) {
    // const moduleTypes: ModuleType[] = [ModuleType.BOTH];

    // if (type === ServiceType.SINGLE) moduleTypes.push(ModuleType.SINGLE);
    // else if (type === ServiceType.COMBO) moduleTypes.push(ModuleType.COMBO);

    const modules = await this.moduleRepo.find({
      where: {
        id: In(moduleIds),
        // type: In(moduleTypes),
      },
    });

    return modules;
  }
}
