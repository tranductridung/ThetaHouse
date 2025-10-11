import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @RequirePermissions('enrollment:create')
  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @RequirePermissions('enrollment:read')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.enrollmentService.findAll(paginationDto);
  }

  @RequirePermissions('enrollment:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentService.findOne(+id);
  }

  @RequirePermissions('enrollment:update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(+id, updateEnrollmentDto);
  }

  @RequirePermissions('enrollment:update')
  @Patch(':id')
  withdraw(@Param('id') id: string) {
    return this.enrollmentService.withdraw(+id);
  }
}
