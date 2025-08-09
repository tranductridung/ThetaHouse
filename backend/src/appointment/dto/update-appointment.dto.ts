import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTherapyAppointmentDto } from './create-appointment.dto';

export class UpdateAppointmentDto extends PartialType(
  OmitType(CreateTherapyAppointmentDto, ['itemId', 'duration'] as const),
) {}
