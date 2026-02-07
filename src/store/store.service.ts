import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(Store) private readonly storeRepository: Repository<Store>
    ) {}

    async getStoreByUser(user: User): Promise<Store> {
        const store = await this.storeRepository.findOne({
            where: {
                owner: {id: user.id}
            }
        })
        if (!store) {
            throw new NotFoundException('Store does not exist!')
        }
        return store;
    }


    async confirmProductInStore(user: User, product: Product): Promise<Store> {
        const store = await this.storeRepository.findOne({
            where: {
                owner: {id: user.id}
            }
        })
        if (!store) {
            throw new NotFoundException('Store does not exist!')
        }
        if (product.store.id !== store.id) {
            throw new UnauthorizedException("This user does not own the product!")
        }
        return store;
    }
}
