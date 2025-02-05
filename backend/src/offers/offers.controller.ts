import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('offers')
@UseGuards(AuthGuard('jwt'))
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Req() req) {
    const { user } = req;
    return this.offersService.create(createOfferDto, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(+id);
  }

  @Get()
  getAll() {
    return this.offersService.getAll();
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() updateOfferDto) {
    return this.offersService.updateOne(+id, updateOfferDto);
  }

  @Delete(':id')
  removeOne(@Param('id') id: string) {
    return this.offersService.removeOne(+id);
  }
}
