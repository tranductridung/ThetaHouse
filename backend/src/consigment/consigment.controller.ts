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

@UseGuards(AuthJwtGuard)
@Controller('consigments')
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
    const consigments = await this.consigmentService.findAll();
    return { consigments };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const consigment = await this.consigmentService.findOneFull(+id);
    return { consigment };
  }

  @Get('items/:itemId/handle')
  async exportItem(@Param('itemId') itemId: string, @Req() req: Request) {
    const creatorId = Number(req.user?.id);
    const result = await this.consigmentService.handledItem(+itemId, creatorId);
    return result;
  }

  @Get(':id/handle')
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
