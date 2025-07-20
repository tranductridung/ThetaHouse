import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CourseRole, UserRole } from 'src/common/enums/enum';
import { CreateCourseStaffDto } from './dto/create-course-staff.dto';

@UseGuards(AuthJwtGuard, RolesGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get('all')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.courseService.findAll(paginationDto);
  }

  @Get()
  findAllActive(@Query() paginationDto: PaginationDto) {
    return this.courseService.findAllActive(paginationDto);
  }

  @Get(':id/enrollments')
  getEnrollmentsByCourse(
    @Query() paginationDto: PaginationDto,
    @Param('id') courseId: number,
  ) {
    return this.courseService.getEnrollmentsByCourse(courseId, paginationDto);
  }

  @Roles(UserRole.ADMIN)
  @Get('staff')
  async getAllCourseStaff(@Query() paginationDto: PaginationDto) {
    return await this.courseService.getCourseStaff(undefined, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findOne(+id);
    return { course };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.courseService.remove(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.courseService.restore(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.courseService.toggleStatus(+id);
  }

  @Roles(UserRole.ADMIN)
  @Get(':courseId/staff')
  async getCourseStaff(
    @Query() paginationDto: PaginationDto,
    @Param('courseId') courseId: number,
  ) {
    return await this.courseService.getCourseStaff(courseId, paginationDto);
  }

  @Roles(UserRole.ADMIN)
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

  @Roles(UserRole.ADMIN)
  @Delete(':courseId/staff/:staffId')
  async removeStaff(
    @Param('courseId') courseId: string,
    @Param('staffId') staffId: string,
  ) {
    return await this.courseService.removeStaff(+staffId, +courseId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':courseId/staff/:staffId/change-role')
  async changRole(
    @Param('courseId') courseId: string,
    @Param('staffId') staffId: string,
    @Body('role') role: CourseRole,
  ) {
    return await this.courseService.changeRole(+staffId, +courseId, role);
  }
}
