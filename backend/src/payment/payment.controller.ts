import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthJwtGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
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
