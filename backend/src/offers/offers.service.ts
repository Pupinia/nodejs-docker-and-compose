import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Offer } from './entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

import { validate } from 'class-validator';
import { DataSource } from 'typeorm';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    private readonly dataSource: DataSource,
  ) {}

  private async validate(createOfferDto: CreateOfferDto) {
    const offer = new Offer();
    for (const key in createOfferDto) {
      offer[key] = createOfferDto[key];
    }
    const errors = await validate(offer, { whitelist: true });
    if (errors.length) {
      throw new BadRequestException('Validation failed');
    }
    return offer;
  }

  async create(createOfferDto: CreateOfferDto, userId: number): Promise<Offer> {
    const { itemId, amount } = createOfferDto;

    const offer = await this.validate(createOfferDto);

    const user = await this.userRepository.findOne({
      relations: {
        wishes: true,
      },
      where: {
        id: userId,
      },
    });

    const wish = await this.wishRepository.findOneBy({ id: itemId });

    if (!wish) throw new BadRequestException('Нет подарка с таким id');

    const isHasWish = user.wishes.some((item) => item.id === wish.id);

    if (!isHasWish) {
      offer.user = user;
      offer.item = wish;

      wish.raised = Number(wish.raised) + amount;

      if (wish.raised > wish.price) {
        throw new BadRequestException('Cумма превышает необходимую');
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await this.wishRepository.save(wish);
        return this.offerRepository.save(offer);
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
    throw new BadRequestException('Нельзя скинуться на свой подарок');
  }

  async findOne(id: number): Promise<Offer> {
    return this.offerRepository.findOne({
      where: { id },
    });
  }

  getAll(): Promise<Offer[]> {
    return this.offerRepository.find({
      relations: {
        user: true,
        item: true,
      },
    });
  }

  async updateOne(id: number, updateOffer: Offer) {
    return this.offerRepository.update({ id }, updateOffer);
  }

  async removeOne(id: number) {
    return this.offerRepository.delete(id);
  }
}
