import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Request } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreateTransactionNoSourceDto } from './dto/create-transaction-no-source.dto';

@UseGuards(AuthJwtGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

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

  @Get()
  findAll() {
    return this.transactionService.findAll();
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
