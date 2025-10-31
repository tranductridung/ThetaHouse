import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { AppointmentService } from './appointment.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CreateTherapyAppointmentDto } from './dto/create-appointment.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { UpdateConsultationAppointmentDto } from './dto/update-consultation-appointment.dto';
import { CreateConsultationAppointmentDto } from './dto/create-consultation-appointment.dto';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @RequirePermissions('appointment:update')
  @Get('toggle')
  toggle() {
    return this.appointmentService.toggle();
  }

  @RequirePermissions('appointment:create')
  @Post('therapy')
  async createTherapyApt(
    @Body() createTherapyAppointmentDto: CreateTherapyAppointmentDto,
  ) {
    return await this.appointmentService.createTherapyApt(
      createTherapyAppointmentDto,
    );
  }

  @RequirePermissions('appointment:create')
  @Post('consultation')
  async createConsultationApt(
    @Body() createConsultationAppointmentDto: CreateConsultationAppointmentDto,
  ) {
    return await this.appointmentService.createConsultationApt(
      createConsultationAppointmentDto,
    );
  }

  @RequirePermissions('appointment:read')
  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.appointmentService.findAll(paginationDto);
  }

  @RequirePermissions('appointment:read')
  @Get('active')
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.appointmentService.findAllActive(paginationDto);
  }

  @RequirePermissions('appointment:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const appointment = await this.appointmentService.findOne(+id);
    return { appointment };
  }

  @RequirePermissions('appointment:update')
  @Patch('therapy/:id')
  async updateTherapyApt(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    const appointment = await this.appointmentService.updateTherapyApt(
      +id,
      updateAppointmentDto,
    );
    return { appointment };
  }

  @RequirePermissions('appointment:update')
  @Patch('consultation/:id')
  async updateConsultationApt(
    @Param('id') id: string,
    @Body() updateConsultationAppointmentDto: UpdateConsultationAppointmentDto,
  ) {
    const appointment = await this.appointmentService.updateConsultationApt(
      +id,
      updateConsultationAppointmentDto,
    );
    return { appointment };
  }

  @RequirePermissions('appointment:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }

  @RequirePermissions('appointment:update')
  @Post(':id/complete')
  async setCompleteStatus(@Param('id') id: string) {
    await this.appointmentService.setCompleteStatus(+id);
    return { message: 'Appointment is mark as completed!' };
  }
}
