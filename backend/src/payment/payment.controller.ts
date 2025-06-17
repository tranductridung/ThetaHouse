import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@UseGuards(AuthJwtGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const payment = await this.paymentService.create(
      createPaymentDto,
      creatorId,
    );

    return { payment };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.paymentService.findAll(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payment = await this.paymentService.findOne(+id);
    return { payment };
  }
}
