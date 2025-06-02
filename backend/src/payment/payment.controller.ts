import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';

@UseGuards(AuthJwtGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: Request) {
    const creatorId = Number(req.user?.id);
    return this.paymentService.create(createPaymentDto, creatorId);
  }

  @Get()
  async findAll() {
    const payments = await this.paymentService.findAll();
    return { payments };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payment = await this.paymentService.findOne(+id);
    return { payment };
  }
}
