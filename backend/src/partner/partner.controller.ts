import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { PartnerService } from './partner.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { AppointmentCategory, PartnerType } from 'src/common/enums/enum';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @RequirePermissions('partner:create')
  @Post()
  async create(@Body() createPartnerDto: CreatePartnerDto) {
    const partner = await this.partnerService.create(createPartnerDto);
    return { partner };
  }

  @RequirePermissions('partner:read')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.partnerService.findAll(paginationDto);
  }

  @RequirePermissions('partner:read', 'transaction:read')
  @Get(':partnerId/transactions')
  async getTransactionsByPartner(@Param('partnerId') partnerId: number) {
    return await this.partnerService.getTransactionsByPartner(partnerId);
  }

  @RequirePermissions('partner:read')
  @Get('/customer')
  async findAllActiveCustomer(@Query() paginationDto: PaginationDto) {
    return await this.partnerService.findAllByType(
      PartnerType.CUSTOMER,
      paginationDto,
    );
  }

  @RequirePermissions('partner:read', 'order:read')
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

  @RequirePermissions('partner:read', 'enrollment:read')
  @Get('/customers/:customerId/enrollments')
  async getCustomerEnrollment(
    @Param('customerId') customerId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.partnerService.getEnrollmentByCustomer(
      customerId,
      false,
      paginationDto,
    );
  }

  @RequirePermissions('partner:read', 'consignment:read')
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

  @RequirePermissions('partner:read', 'purchase:read')
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

  @RequirePermissions('partner:read', 'consignment:read')
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

  @RequirePermissions('partner:read', 'appointment:read')
  @Get('/customers/:customerId/appointments')
  async findAppointmentByCustomer(
    @Param('customerId') customerId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.partnerService.findAppointmentByCustomer(
      customerId,
      undefined,
      paginationDto,
    );
  }

  @RequirePermissions('partner:read', 'appointment:read')
  @Get('/customers/:customerId/appointments/:category')
  async findConsultationAppointmentByCustomer(
    @Param('customerId') customerId: number,
    @Param('category') category: AppointmentCategory,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.partnerService.findAppointmentByCustomer(
      customerId,
      category,
      paginationDto,
    );
  }

  @RequirePermissions('partner:read')
  @Get('/supplier')
  async findAllActiveSupllier(@Query() paginationDto: PaginationDto) {
    return await this.partnerService.findAllByType(
      PartnerType.SUPPLIER,
      paginationDto,
    );
  }

  @RequirePermissions('partner:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const partner = await this.partnerService.findOne(+id);
    return { partner };
  }

  @RequirePermissions('partner:update')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    const partner = await this.partnerService.update(+id, updatePartnerDto);
    return { partner };
  }

  @RequirePermissions('partner:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnerService.remove(+id);
  }
}
