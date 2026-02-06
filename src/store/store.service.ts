import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(Store) private readonly storeRepository: Repository<Store>
    ) {}

    async getStoreByUser(user: User): Promise<Store> {
        console.log(user, "USER HERE=>");
        
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
}
