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
import { Request } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreateTransactionNoSourceDto } from './dto/create-transaction-no-source.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@UseGuards(AuthJwtGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async find(@Query() paginationDto?: PaginationDto) {
    return await this.transactionService.findAll(paginationDto);
  }

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}
