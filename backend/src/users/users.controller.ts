import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@Req() req) {
    const { user } = req.user;
    return this.usersService.getCurrentUser(user);
  }

  @Patch('me')
  updateOne(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    return this.usersService.updateOne(updateUserDto, req.user.id);
  }

  @Get('me/wishes')
  getCurrentUserWishes(@Req() req) {
    return this.usersService.findCurrentUserWishes(req.user.id);
  }

  @Post('find')
  async findMany(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }

  @Get(':username')
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get(':username/wishes')
  getWishesByUsername(@Param('username') username: string) {
    return this.usersService.findWishesByUsername(username);
  }
}
