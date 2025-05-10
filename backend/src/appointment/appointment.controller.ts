import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@UseGuards(AuthJwtGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}
  @Get('toggle')
  toggle() {
    return this.appointmentService.toggle();
  }

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    const appointment =
      await this.appointmentService.create(createAppointmentDto);
    return { appointment };
  }

  @Get()
  async findAll() {
    const appointments = await this.appointmentService.findAll();
    return { appointments };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const appointment = await this.appointmentService.findOne(+id);
    return { appointment };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    const appointment = await this.appointmentService.update(
      +id,
      updateAppointmentDto,
    );
    return { appointment };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }
}
