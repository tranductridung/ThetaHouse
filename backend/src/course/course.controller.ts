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
import { CourseService } from './course.service';
import { CourseRole } from 'src/common/enums/enum';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateCourseStaffDto } from './dto/create-course-staff.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @RequirePermissions('course:create')
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @RequirePermissions('course:read')
  @Get('all')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.courseService.findAll(paginationDto);
  }

  @RequirePermissions('course:read')
  @Get()
  findAllActive(@Query() paginationDto: PaginationDto) {
    return this.courseService.findAllActive(paginationDto);
  }

  @RequirePermissions('course:read', 'enrollment:read')
  @Get(':id/enrollments')
  getEnrollmentsByCourse(
    @Query() paginationDto: PaginationDto,
    @Param('id') courseId: number,
  ) {
    return this.courseService.getEnrollmentsByCourse(courseId, paginationDto);
  }

  @RequirePermissions('course:read', 'user:read')
  @Get('staff')
  async getAllCourseStaff(@Query() paginationDto: PaginationDto) {
    return await this.courseService.getCourseStaff(undefined, paginationDto);
  }

  @RequirePermissions('course:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findOne(+id);
    return { course };
  }

  @RequirePermissions('course:update', 'course:read')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @RequirePermissions('course:delete', 'course:read')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.courseService.remove(+id);
  }

  @RequirePermissions('course:read', 'user:read')
  @Get(':courseId/staff')
  async getCourseStaff(
    @Query() paginationDto: PaginationDto,
    @Param('courseId') courseId: number,
  ) {
    return await this.courseService.getCourseStaff(courseId, paginationDto);
  }

  @RequirePermissions('course:update', 'course:read')
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.courseService.restore(+id);
  }

  @RequirePermissions('course:update', 'course:read')
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.courseService.toggleStatus(+id);
  }

  @RequirePermissions('course:update', 'user:read', 'course:read')
  @Post(':courseId/staff')
  async addStaff(
    @Body() body: Pick<CreateCourseStaffDto, 'role' | 'staffId'>,
    @Param('courseId') courseId: number,
  ) {
    const createCourseStaffDto: CreateCourseStaffDto = {
      ...body,
      courseId,
    };
    return await this.courseService.addStaff(createCourseStaffDto);
  }

  @RequirePermissions('course:delete', 'course:read')
  @Delete(':courseId/staff/:staffId')
  async removeStaff(
    @Param('courseId') courseId: string,
    @Param('staffId') staffId: string,
  ) {
    return await this.courseService.removeStaff(+staffId, +courseId);
  }

  @RequirePermissions('course:update', 'course:read')
  @Patch(':courseId/staff/:staffId/change-role')
  async changRole(
    @Param('courseId') courseId: string,
    @Param('staffId') staffId: string,
    @Body('role') role: CourseRole,
  ) {
    return await this.courseService.changeRole(+staffId, +courseId, role);
  }
}
