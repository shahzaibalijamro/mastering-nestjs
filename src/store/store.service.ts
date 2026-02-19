import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ConfirmationMsg } from '../temp_utils/confirmation.interface';
import { CreateStoreDTO, UpdateStoreDTO } from './dto/store.dto';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productsService: ProductsService
  ) {}

  async getStoreByUser(userId: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: {
        owner: { id: userId },
      },
      select: ['address', 'phoneNumber', 'idCardNumber' , 'createdAt' , 'updatedAt' , 'name' , 'description' , 'id' , 'picture']
    });
    if (!store) {
      throw new NotFoundException('Store does not exist!');
    }
    return store;
  }

  async confirmProductInStore(user: UserWithoutPassword, product: Product): Promise<Store> {
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
      message: 'Store created!',
    };
  }

  async updateStore(
    body: UpdateStoreDTO,
    user: UserWithoutPassword,
    pictureRaw?: Express.Multer.File,
  ): Promise<Store> {
    const store = await this.getStoreByUser(user.id);
    const { name, address, description, idCardNumber, phoneNumber } = body;
    if (name) {
      await this.confirmStoreNameIsUnique(name);
      store.name = name;
    }
    store.address = address || store.address;
    store.description = description || store.description;
    store.idCardNumber = idCardNumber || store.idCardNumber;
    store.phoneNumber = phoneNumber || store.phoneNumber;
    if (pictureRaw) {
      const { url, public_id } =
        await this.cloudinaryService.uploadFile(pictureRaw);
      store.picture = {
        url,
        cloudinaryPublicId: public_id,
      };
    }
    await this.storeRepository.save(store);
    return store;
  }


  async deleteStore(
    user: UserWithoutPassword
  ): Promise<ConfirmationMsg> {
    const store: Store = await this.getStoreByUser(user.id);
    const storeId = store.id;
    const storeProducts = await this.productsService.getProductsByUser(user);
    if (store.picture && store.picture.cloudinaryPublicId !== "wmremove-transformed_hnlfyc") {
      await this.cloudinaryService.deleteFile(store.picture.cloudinaryPublicId);
    }
    if (storeProducts.length > 0) {
      const productIds = storeProducts.map((product) => product.id);
      await this.productsService.deleteMultipleProducts({ids: productIds}, user);
    }
    await this.storeRepository.remove(store);
    return {
      id: storeId,
      message: "Store deleted!"
    }
  }
}
