import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createWishDto: CreateWishDto, @Req() req) {
    const { user } = req;
    return this.wishesService.create(createWishDto, user.id);
  }

  @Get('last')
  getLastWishes() {
    return this.wishesService.getLastWishes();
  }

  @Get('top')
  getPopularWishes() {
    return this.wishesService.getPopularWishes();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.wishesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  updateOne(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req,
  ) {
    const { user } = req;
    return this.wishesService.updateOne(+id, updateWishDto, user.id);
  }

  @Post(':id/copy')
  @UseGuards(AuthGuard('jwt'))
  copy(@Param('id') id: string, @Req() req) {
    const { user } = req;
    return this.wishesService.copy(+id, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  removeOne(@Param('id') id: string, @Req() req) {
    const { user } = req;
    return this.wishesService.removeOne(+id, user.id);
  }
}
