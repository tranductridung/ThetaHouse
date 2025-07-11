import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';

export class UpdateAppointmentDto extends PartialType(
  OmitType(CreateAppointmentDto, ['itemId', 'duration'] as const),
) {}
