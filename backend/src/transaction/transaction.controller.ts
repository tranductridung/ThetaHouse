import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Request, Response } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreateTransactionNoSourceDto } from './dto/create-transaction-no-source.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @RequirePermissions('transaction:create')
  @Get('healer-salary/:month/:year')
  async createHealerSalaryTransaction(
    @Param('month') month: string,
    @Param('year') year: string,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);

    const transaction =
      await this.transactionService.createSalaryTransactionsForAllHealers(
        +month,
        +year,
        creatorId,
      );

    return { transaction };
  }

  @RequirePermissions('transaction:read')
  @Get()
  async find(@Query() paginationDto?: PaginationDto) {
    return await this.transactionService.findAll(paginationDto);
  }

  @RequirePermissions('transaction:create')
  @Post()
  async create(
    @Body() createTransactionNoSourceDto: CreateTransactionNoSourceDto,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const transaction = await this.transactionService.createNoSource(
      createTransactionNoSourceDto,
      creatorId,
    );
    return { transaction };
  }

  @RequirePermissions('transaction:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(+id);
  }

  @RequirePermissions('transaction:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }

  @RequirePermissions('transaction:read', 'payment:read', 'source:read')
  @Get('/:sources/:id')
  async findOneBySourceId(
    @Param('id') id: string,
    @Param('sources') sources: string,
  ) {
    const transaction = await this.transactionService.findOneBySourceId(
      +id,
      sources,
    );

    return { transaction };
  }
}
