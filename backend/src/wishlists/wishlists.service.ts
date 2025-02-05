import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { validate } from 'class-validator';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  private async wishListValidate(wishlist: CreateWishlistDto) {
    const wishList = new Wishlist();

    for (const key in wishlist) {
      wishList[key] = wishlist[key];
    }

    const errors = await validate(wishList, { whitelist: true });

    if (errors.length) {
      throw new BadRequestException('Validation failed');
    }

    return wishList;
  }

  async create(wishlist: CreateWishlistDto, userId: number): Promise<Wishlist> {
    const { itemsId } = wishlist;

    const items = itemsId.map((item) => ({
      id: item,
    }));

    const wishList = await this.wishListValidate(wishlist);
    const user = await this.userRepository.findOneBy({ id: userId });
    const wishes = await this.wishRepository.find({
      where: items,
    });

    wishList.owner = user;
    wishList.items = wishes;

    return this.wishlistRepository.save(wishlist);
  }

  async findOne(id: number): Promise<Wishlist> {
    return this.wishlistRepository.findOne({
      relations: {
        items: true,
        owner: true,
      },
      where: {
        id,
      },
    });
  }

  async findAll() {
    return this.wishlistRepository.find();
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishList = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });

    for (const key in updateWishlistDto) {
      if (key === 'itemsId') {
        const items = updateWishlistDto[key].map((item) => ({
          id: item,
        }));

        const wishes = await this.wishRepository.find({
          where: items,
        });

        wishList.items = wishes;
      } else {
        wishList[key] = updateWishlistDto[key];
      }
    }

    return this.wishlistRepository.save(wishList);
  }

  async removeOne(id: number, userId: number) {
    const wishList = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });
    return await this.wishlistRepository.remove(wishList);
  }
}
