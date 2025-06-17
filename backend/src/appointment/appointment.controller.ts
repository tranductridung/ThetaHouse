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
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

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

  @Get('/all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.appointmentService.findAll(paginationDto);
  }

  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.appointmentService.findAllActive(paginationDto);
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

  @Post(':id/complete')
  async setCompleteStatus(@Param('id') id: string) {
    const result = await this.appointmentService.setCompleteStatus(+id);
    return { message: 'set complete', result };
  }
}
