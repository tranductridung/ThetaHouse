import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateConsultationAppointmentDto } from './create-consultation-appointment.dto';

export class UpdateConsultationAppointmentDto extends PartialType(
  OmitType(CreateConsultationAppointmentDto, ['customerId'] as const),
) {}
