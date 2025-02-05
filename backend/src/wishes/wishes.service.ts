import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { validate } from 'class-validator';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async wishValidate(createWishDto: CreateWishDto) {
    const wish = new Wish();

    for (const key in createWishDto) {
      wish[key] = createWishDto[key];
    }

    const errors = await validate(wish, { whitelist: true });

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    return wish;
  }

  async create(createWishDto: CreateWishDto, userId: number): Promise<Wish> {
    const wish = await this.wishValidate(createWishDto);

    const user = await this.userRepository.findOneBy({ id: userId });

    wish.owner = user;

    return this.wishesRepository.save(wish);
  }

  getLastWishes() {
    return this.wishesRepository.find({
      order: {
        createdAt: 'DESC',
      },

      take: 40,
      skip: 0,
    });
  }

  getPopularWishes() {
    return this.wishesRepository.find({
      order: {
        copied: 'DESC',
      },

      take: 20,
      skip: 0,
    });
  }

  async findOne(id: number): Promise<Wish> {
    const wish = this.wishesRepository.findOne({
      relations: {
        offers: {
          user: true,
        },
        owner: true,
      },
      where: {
        id,
      },
    });

    if (!wish) throw new BadRequestException('Подарок с таким id не найден');

    return wish;
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const wish = await this.wishesRepository.findOne({
      relations: {
        offers: true,
        owner: true,
      },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });

    if (!wish) throw new BadRequestException('Подарок с таким id не найден');

    if (!wish.offers.length) {
      for (const key in updateWishDto) {
        wish[key] = updateWishDto[key];
      }
      return this.wishesRepository.save(wish);
    }
    return wish;
  }

  async copy(id: number, userId: number) {
    const wish = await this.wishesRepository.findOneBy({ id });

    if (!wish) throw new BadRequestException('Подарок с таким id не найден');

    const user = await this.userRepository.findOne({
      relations: {
        wishes: true,
      },
      where: {
        id: userId,
      },
    });

    const isWishHas = user.wishes.some((item) => item.id === wish.id);

    if (!isWishHas) {
      const newWish = this.wishesRepository.create(wish);

      newWish.copied = 0;
      newWish.raised = 0;
      newWish.owner = user;

      wish.copied++;

      await this.wishesRepository.save(wish);
      await this.wishesRepository.insert(newWish);
    }
    return user;
  }

  async removeOne(id: number, userId: number) {
    const wish = await this.wishesRepository.findOne({
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

    if (!wish) throw new BadRequestException('Подарок с таким id не найден');

    try {
      return await this.wishesRepository.remove(wish);
    } catch (err) {
      throw new ConflictException(
        'Нельзя удалить подарок на который уже скинулись',
      );
    }
  }
}
