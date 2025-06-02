import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConsigmentService } from './consigment.service';
import { CreateConsigmentDto } from './dto/create-consigment.dto';
import { Request } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { HandleItemDto } from './dto/handle-item.dto';

@UseGuards(AuthJwtGuard)
@Controller('consignments')
export class ConsigmentController {
  constructor(private readonly consigmentService: ConsigmentService) {}

  @Post()
  async create(
    @Body() createConsigmentDto: CreateConsigmentDto,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const consigment = await this.consigmentService.create(
      createConsigmentDto,
      creatorId,
    );
    return { consigment };
  }

  @Get()
  async findAll() {
    const consignments = await this.consigmentService.findAll();
    return { consignments };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const consignment = await this.consigmentService.findOneFull(+id);
    return { consignment };
  }

  @Post('items/:itemId/handle')
  async exportItem(
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Body() handleItemDto: HandleItemDto,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.consigmentService.handledItem(
      +itemId,
      creatorId,
      handleItemDto.quantity,
    );
    return result;
  }

  @Post(':id/handle')
  async exportItemsForOrder(
    @Param('id') consigmentId: string,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.consigmentService.handleConsigment(
      +consigmentId,
      creatorId,
    );
    return result;
  }
}
