import {
  Get,
  Req,
  Body,
  Post,
  Query,
  Param,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @RequirePermissions('payment:create')
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

  @RequirePermissions('payment:read')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.paymentService.findAll(paginationDto);
  }

  @RequirePermissions('payment:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payment = await this.paymentService.findOne(+id);
    return { payment };
  }
}
