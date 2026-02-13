import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';
import { CreateStoreDTO } from './dto/store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async getStoreByUser(userId: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: {
        owner: { id: userId },
      },
    });
    if (!store) {
      throw new NotFoundException('Store does not exist!');
    }
    return store;
  }

  async confirmProductInStore(user: User, product: Product): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: {
        owner: { id: user.id },
      },
    });
    if (!store) {
      throw new NotFoundException('Store does not exist!');
    }
    if (product.store.id !== store.id) {
      throw new UnauthorizedException('This user does not own the product!');
    }
    return store;
  }

  async confirmNotSeller(id: string): Promise<void> {
    const store = await this.storeRepository.findOne({
      where: {
        owner: { id },
      },
    });
    if (store) {
      throw new BadRequestException('Seller profile already exists');
    }
  }

  async confirmStoreNameIsUnique(name: string): Promise<void> {
    const store = await this.storeRepository.findOneBy({ owner: { name } });
    if (store) {
      throw new BadRequestException(
        'A store already exists with the same name!',
      );
    }
  }

  async createStore(body: CreateStoreDTO): Promise<ConfirmationMsg> {
    const store = this.storeRepository.create(body);
    await this.storeRepository.save(store);
    return {
        id: store.id,
        message: "Store created!"
    }
  }
}
