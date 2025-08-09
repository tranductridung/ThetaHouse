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
import { AppointmentService } from './appointment.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateTherapyAppointmentDto } from './dto/create-appointment.dto';
import { CreateConsultationAppointmentDto } from './dto/create-consultation-appointment.dto';
import { UpdateConsultationAppointmentDto } from './dto/update-consultation-appointment.dto';

@UseGuards(AuthJwtGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}
  @Get('toggle')
  toggle() {
    return this.appointmentService.toggle();
  }

  @Post('therapy')
  async createTherapyApt(
    @Body() createTherapyAppointmentDto: CreateTherapyAppointmentDto,
  ) {
    return await this.appointmentService.createTherapyApt(
      createTherapyAppointmentDto,
    );
  }

  @Post('consultation')
  async createConsultationApt(
    @Body() createConsultationAppointmentDto: CreateConsultationAppointmentDto,
  ) {
    return await this.appointmentService.createConsultationApt(
      createConsultationAppointmentDto,
    );
  }

  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.appointmentService.findAll(paginationDto);
  }

  @Get('active')
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.appointmentService.findAllActive(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const appointment = await this.appointmentService.findOne(+id);
    return { appointment };
  }

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }

  @Post(':id/complete')
  async setCompleteStatus(@Param('id') id: string) {
    await this.appointmentService.setCompleteStatus(+id);
    return { message: 'Appointment is mark as completed!' };
  }
}
