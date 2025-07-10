import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PartnerService } from './partner.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnerType } from 'src/common/enums/enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  async create(@Body() createPartnerDto: CreatePartnerDto) {
    const partner = await this.partnerService.create(createPartnerDto);
    return { partner };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.partnerService.findAll(paginationDto);
  }

  @Get(':partnerId/transactions')
  async getTransactionsByPartner(@Param('partnerId') partnerId: number) {
    return await this.partnerService.getTransactionsByPartner(partnerId);
  }

  @Get('/customer')
  async findAllActiveCustomer(@Query() paginationDto: PaginationDto) {
    return await this.partnerService.findAllByType(
      PartnerType.CUSTOMER,
      paginationDto,
    );
  }

  @Get('/customers/:customerId/orders')
  async getCustomerOrder(
    @Param('customerId') customerId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.partnerService.getOrderByCustomer(
      customerId,
      false,
      paginationDto,
    );
  }

  @Get('/customers/:customerId/consignments')
  async getCustomerConsignments(
    @Param('customerId') customerId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.partnerService.getConsignmentByPartner(
      customerId,
      false,
      paginationDto,
    );
  }

  @Get('/suppliers/:supplierId/purchases')
  async getSupplierPurchase(
    @Param('supplierId') supplierId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.partnerService.getPurchaseBySupplier(
      supplierId,
      false,
      paginationDto,
    );
  }

  @Get('/suppliers/:supplierId/consignments')
  async getSupplierConsignments(
    @Param('supplierId') supplierId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.partnerService.getConsignmentByPartner(
      supplierId,
      false,
      paginationDto,
    );
  }

  @Get('/customers/:customerId/appointments')
  async findAppointmentByCustomer(
    @Param('customerId') customerId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.partnerService.findAppointmentByCustomer(
      customerId,
      paginationDto,
    );
  }

  @Get('/supplier')
  async findAllActiveSupllier(@Query() paginationDto: PaginationDto) {
    return await this.partnerService.findAllByType(
      PartnerType.SUPPLIER,
      paginationDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const partner = await this.partnerService.findOne(+id);
    return { partner };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    const partner = await this.partnerService.update(+id, updatePartnerDto);
    return { partner };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnerService.remove(+id);
  }
}
