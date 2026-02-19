import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { Product } from '../products/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { ConfirmationMsg } from '../temp_utils/confirmation.interface';
import { In, Repository } from 'typeorm';
import { ProductFavoriteStatusDto } from './dto/product-favorite-status.dto';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addProductToFavorites(
    user: UserWithoutPassword,
    productId: string,
  ): Promise<ConfirmationMsg> {
    await this.ensureProductExists(productId);

    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        userId: user.id,
        productId,
      },
    });

    if (existingFavorite) {
      return {
        id: existingFavorite.id,
        message: 'Product already in favorites.',
      };
    }

    const favorite = this.favoriteRepository.create({
      user: { id: user.id } as User,
      product: { id: productId } as Product,
      userId: user.id,
      productId,
    });
    await this.favoriteRepository.save(favorite);

    return {
      id: favorite.id,
      message: 'Product added to favorites!',
    };
  }

  async removeProductFromFavorites(
    user: UserWithoutPassword,
    productId: string,
  ): Promise<ConfirmationMsg> {
    await this.ensureProductExists(productId);

    const favorite = await this.favoriteRepository.findOne({
      where: {
        userId: user.id,
        productId,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Product is not in favorites');
    }

    const favoriteId = favorite.id;
    await this.favoriteRepository.remove(favorite);

    return {
      id: favoriteId,
      message: 'Product removed from favorites!',
    };
  }

  async getFavoriteProducts(user: UserWithoutPassword): Promise<Product[]> {
    const favoriteRows = await this.favoriteRepository.find({
      where: {
        userId: user.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (favoriteRows.length === 0) {
      return [];
    }

    const orderedProductIds = favoriteRows.map((row) => row.productId);
    const products = await this.productRepository.find({
      where: {
        id: In(orderedProductIds),
      },
      loadEagerRelations: false,
    });

    const favoritesCountByProductId =
      await this.getFavoritesCountByProductIds(orderedProductIds);
    const productById = new Map(products.map((product) => [product.id, product]));

    return orderedProductIds
      .map((id) => productById.get(id))
      .filter((product): product is Product => Boolean(product))
      .map((product) => {
        product.favoritesCount = favoritesCountByProductId.get(product.id) ?? 0;
        product.isFavorited = true;
        return product;
      });
  }

  async getFavoriteProductIds(user: UserWithoutPassword): Promise<string[]> {
    const favorites = await this.favoriteRepository.find({
      where: {
        userId: user.id,
      },
      order: {
        createdAt: 'DESC',
      },
      select: {
        productId: true,
      },
    });
    return favorites.map((item) => item.productId);
  }

  async getProductFavoriteStatus(
    user: UserWithoutPassword,
    productId: string,
  ): Promise<ProductFavoriteStatusDto> {
    await this.ensureProductExists(productId);

    const [favorite, favoritesCount] = await Promise.all([
      this.favoriteRepository.findOne({
        where: {
          userId: user.id,
          productId,
        },
      }),
      this.favoriteRepository.count({
        where: {
          productId,
        },
      }),
    ]);

    return {
      productId,
      isFavorited: Boolean(favorite),
      favoritesCount,
    };
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      select: {
        id: true,
      },
      loadEagerRelations: false,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private async getFavoritesCountByProductIds(
    productIds: string[],
  ): Promise<Map<string, number>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const rows = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .select('favorite.productId', 'productId')
      .addSelect('COUNT(favorite.id)', 'favoritesCount')
      .where('favorite.productId IN (:...productIds)', { productIds })
      .groupBy('favorite.productId')
      .getRawMany<{ productId: string; favoritesCount: string }>();

    return new Map(
      rows.map((row) => [row.productId, Number.parseInt(row.favoritesCount, 10)]),
    );
  }
}
