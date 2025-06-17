import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { HandleItemDto } from './dto/handle-item.dto';
import { ConsignmentService } from './consigment.service';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@UseGuards(AuthJwtGuard)
@Controller('consignments')
export class ConsignmentController {
  constructor(private readonly consignmentService: ConsignmentService) {}

  @Post()
  async create(
    @Body() createConsignmentDto: CreateConsignmentDto,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const consignment = await this.consignmentService.create(
      createConsignmentDto,
      creatorId,
    );
    return { consignment };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.consignmentService.findAll(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const consignment = await this.consignmentService.findOneFull(+id);
    return { consignment };
  }

  @Post('items/:itemId/handle')
  async exportItem(
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Body() handleItemDto: HandleItemDto,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.consignmentService.handledItem(
      +itemId,
      creatorId,
      handleItemDto.quantity,
    );
    return result;
  }

  @Post(':id/handle')
  async handleItemsForConsignment(
    @Param('id') consignmentId: string,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.consignmentService.handleConsignment(
      +consignmentId,
      creatorId,
    );
    return result;
  }

  @Post(':id/cancel')
  async cancelConsignment(@Param('id') id: string, @Req() req: Request) {
    const creatorId = Number(req.user?.id);

    const result = await this.consignmentService.cancelConsignment(
      +id,
      creatorId,
    );
    return result;
  }

  @Post(':id/items')
  async addItem(
    @Param('id') consignmentId: string,
    @Body() createItemDto: CreateItemDto,
  ) {
    const result = await this.consignmentService.addItem(
      +consignmentId,
      createItemDto,
    );
    return result;
  }

  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') consignmentId: string,
    @Param('itemId') itemId: string,
  ) {
    const result = await this.consignmentService.removeItem(
      +consignmentId,
      +itemId,
    );
    return result;
  }
}
