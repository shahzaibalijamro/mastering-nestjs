import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Media, MediaType, Product } from './entities/product.entity';
import {
  CreateProductDTO,
  deleteMultipleProductsDTO,
  FilterBy,
  getProductsFilterDTO,
  PaginatedProductsDTO,
  UpdateProductDTO,
  UpdateProductMediaDTO,
} from './dto/products.dto';
import { ConfirmationMsg } from '../utils/confirmation.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { formatCloudinaryMediaFiles } from '../utils/utils';
import { TagsService } from '../tags/tags.service';
import {
  UserWithoutPassword,
} from '../auth/interfaces/user.interface';
import { User } from '../user/entities/user.entity';
import { Tag } from '../tags/entities/tags.entity';
import { ReviewsService } from '../reviews/reviews.service';
import { ProductReview } from '../reviews/entities/reviews.entity';
import { Store } from '../store/entities/store.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly tagsService: TagsService,
    private readonly reviewsService: ReviewsService,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  private async getStoreByUser(userId: string): Promise<Store> {
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

  private async confirmProductInStore(user: UserWithoutPassword, product: Product): Promise<Store> {
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

  async getProducts(
    queryParams: getProductsFilterDTO,
  ): Promise<PaginatedProductsDTO> {
    const {
      filterBy = FilterBy.NEWEST,
      searchQuery,
      tag,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = queryParams;

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException('minPrice cannot be greater than maxPrice');
    }

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (tag) {
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1
          FROM "product_tags" "productTag"
          INNER JOIN "tag" "tagFilter" ON "tagFilter"."id" = "productTag"."tagId"
          WHERE "productTag"."productId" = "product"."id"
            AND LOWER("tagFilter"."name") = LOWER(:tag)
        )`,
        { tag: tag.trim() },
      );
    }

    if (searchQuery?.trim()) {
      const normalizedSearch = `%${searchQuery.trim()}%`;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(product.name) LIKE LOWER(:searchQuery)', {
            searchQuery: normalizedSearch,
          }).orWhere('LOWER(product.description) LIKE LOWER(:searchQuery)', {
            searchQuery: normalizedSearch,
          });
        }),
      );
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const total = await queryBuilder.clone().getCount();

    switch (filterBy) {
      case FilterBy.OLDEST:
        queryBuilder.orderBy('product.createdAt', 'ASC');
        break;
      case FilterBy.PRICE_ASC:
      case FilterBy.PRICE_LTH:
        queryBuilder.orderBy('product.price', 'ASC');
        break;
      case FilterBy.PRICE_DESC:
      case FilterBy.PRICE_HTL:
        queryBuilder.orderBy('product.price', 'DESC');
        break;
      case FilterBy.MOST_REVIEWED:
        queryBuilder
          .addSelect(
            (qb) =>
              qb
                .select('COUNT(review.id)')
                .from(ProductReview, 'review')
                .where('review.productId = product.id'),
            'reviews_count_sort',
          )
          .orderBy('reviews_count_sort', 'DESC')
          .addOrderBy('product.createdAt', 'DESC');
        break;
      case FilterBy.MOST_FAVORITED:
        queryBuilder
          .addSelect(
            (qb) =>
              qb
                .select('COUNT(favorite.id)')
                .from(Favorite, 'favorite')
                .where('favorite.productId = product.id'),
            'favorites_count_sort',
          )
          .orderBy('favorites_count_sort', 'DESC')
          .addOrderBy('product.createdAt', 'DESC');
        break;
      case FilterBy.NEWEST:
      default:
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
    }

    const products = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const items = await this.attachFavoritesCount(products);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getProductsByTag(tag: Tag): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: {
        tags: {
          id: tag.id
        }
      },
      loadEagerRelations: false,
    })
    return this.attachFavoritesCount(products);
  }

  async getProductsByUser(user: UserWithoutPassword): Promise<Product[]> {
    console.log(user);

    const userStore = await this.getStoreByUser(user.id);
    console.log(userStore);

    const products = await this.productRepository.find({
      where: {
        store: { id: userStore.id },
      },
      relations: {
        store: false,
      },
      loadEagerRelations: false,
    });
    return this.attachFavoritesCount(products);
  }

  async addProduct(
    body: CreateProductDTO,
    files: Array<Express.Multer.File>,
    user: User,
  ): Promise<ConfirmationMsg> {
    //destructure
    const { name, description, price, tagIds } = body;

    //tags fetch
    let tags: Tag[] = [];
    if (tagIds?.length > 0) {
      tags = await Promise.all(
        tagIds.map((id) => this.tagsService.findTagById(id)),
      );
    }

    // fetch user's store
    const store = await this.getStoreByUser(user.id);

    // upload media and format
    const UploadedFiles: UploadApiResponse[] =
      await this.cloudinaryService.uploadFiles(files);
    const media: Media[] = formatCloudinaryMediaFiles(UploadedFiles);

    try {
      //save product
      const product = this.productRepository.create({
        description,
        price,
        name,
        media,
        store,
        tags,
      });
      await this.productRepository.save(product);
      return {
        id: product.id,
        message: 'Product added!',
      };
    } catch (error) {
      // delete uploaded files if failed
      await Promise.all(
        media.map((file) =>
          this.cloudinaryService.deleteFile(file.cloudinaryPublicId),
        ),
      );
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      select: {
        createdAt: true,
        description: true,
        id: true,
        media: true,
        name: true,
        price: true,
        reviews: true,
        store: true,
        tags: true,
        updatedAt: true,
      },
      relations: {
        reviews: {
          user: true
        },
        store: true,
      }
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const withFavoriteCount = await this.attachFavoritesCount([product]);
    return withFavoriteCount[0];
  }

  private async attachFavoritesCount(products: Product[]): Promise<Product[]> {
    if (products.length === 0) {
      return products;
    }

    const productIds = products.map((product) => product.id);
    const rows = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .select('favorite.productId', 'productId')
      .addSelect('COUNT(favorite.id)', 'favoritesCount')
      .where('favorite.productId IN (:...productIds)', { productIds })
      .groupBy('favorite.productId')
      .getRawMany<{ productId: string; favoritesCount: string }>();

    const countsByProductId = new Map(
      rows.map((row) => [row.productId, Number.parseInt(row.favoritesCount, 10)]),
    );

    products.forEach((product) => {
      product.favoritesCount = countsByProductId.get(product.id) ?? 0;
    });

    return products;
  }

  async updateProduct(
    id: string,
    body: UpdateProductDTO,
    user: User,
  ): Promise<ConfirmationMsg> {
    // destructure
    const { name, description, price, media } = body;

    // get product and confirm
    const product = await this.getProductById(id);

    // check if user owns the product
    await this.confirmProductInStore(user, product);

    //update
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    await this.productRepository.save(product);
    return {
      id: product.id,
      message: 'Product updated!',
    };
  }

  async deleteProduct(
    id: string,
    user: UserWithoutPassword,
  ): Promise<ConfirmationMsg> {
    // confirm product exists
    const product = await this.getProductById(id);

    // confirm user owns the product
    await this.confirmProductInStore(user, product);

    // store id to return it later
    const productId = product.id;

    // delete
    await Promise.all(
      product.media.map((item) =>
        this.cloudinaryService.deleteFile(item.cloudinaryPublicId),
      ),
    );

    // delete product reviews as well
    const productReviews: ProductReview[] =
      await this.reviewsService.getProductReviews(product.id);
    for (const review of productReviews) {
      await this.reviewsService.removeReview(review.id, user);
    }

    await this.productRepository.remove(product);

    // return id
    return {
      id: productId,
      message: 'Product deleted!',
    };
  }

  async deleteMultipleProducts(
    body: deleteMultipleProductsDTO,
    user: UserWithoutPassword,
  ) {
    const { ids } = body;
    await Promise.all(ids.map((id) => this.deleteProduct(id, user)));
    return {
      message: `Product${ids.length === 1 ? '' : 's'} deleted!`,
    };
  }

  async updateProductMedia(
    id: string,
    body: UpdateProductMediaDTO,
    file: Express.Multer.File,
    user: User,
  ): Promise<ConfirmationMsg> {
    // get media id from frontend
    const { cloudinaryPublicId } = body;

    // throw error if not found
    if (!cloudinaryPublicId) {
      throw new BadRequestException(
        'cloudinaryPublicId is required for media updation!',
      );
    }

    // confirm product exists
    const product = await this.getProductById(id);

    // confirm user owns the product
    await this.confirmProductInStore(user, product);

    // check if media exists in the product
    const index = product.media.findIndex(
      (media) => media.cloudinaryPublicId === cloudinaryPublicId,
    );
    if (index === -1) {
      throw new NotFoundException('Media not found!');
    }

    // delete old one, upload new one
    const [_, uploadedFile] = await Promise.all([
      this.cloudinaryService.deleteFile(cloudinaryPublicId),
      this.cloudinaryService.uploadFile(file),
    ]);

    // update
    product.media[index].cloudinaryPublicId = uploadedFile.public_id;
    product.media[index].url = uploadedFile.url;
    product.media[index].type = uploadedFile.resource_type as MediaType;
    await this.productRepository.save(product);
    return {
      id: product.id,
      message: 'Media updated!',
    };
  }

  async addProductMedia(
    id: string,
    files: Array<Express.Multer.File>,
    user: User,
  ): Promise<ConfirmationMsg> {
    // fetch product
    const product = await this.getProductById(id);

    // check files limit
    if (files.length > 10 - product.media.length) {
      throw new BadRequestException(
        `Products cannot have more than 10 media files!`,
      );
    }

    // confirm user owns the product
    await this.confirmProductInStore(user, product);

    // upload
    const UploadedFiles: UploadApiResponse[] =
      await this.cloudinaryService.uploadFiles(files);
    const media: Media[] = formatCloudinaryMediaFiles(UploadedFiles);

    // add
    product.media = [...product.media, ...media];
    await this.productRepository.save(product);
    return {
      id: product.id,
      message: 'New product media added!',
    };
  }

  async deleteProductMedia(
    id: string,
    cloudinaryPublicIds: Array<string>,
    user: User,
  ): Promise<ConfirmationMsg> {
    // fetch product
    const product = await this.getProductById(id);

    // return if user has one media
    if (product.media.length < 2) {
      throw new BadRequestException('Product must at least have one media!');
    }

    // confirm user owns the product
    await this.confirmProductInStore(user, product);

    // delete
    await Promise.all(
      cloudinaryPublicIds.map((id) => this.cloudinaryService.deleteFile(id)),
    );

    // update product
    const filteredMedia = product.media.filter(
      (item) => !cloudinaryPublicIds.includes(item.cloudinaryPublicId),
    );
    product.media = filteredMedia;
    await this.productRepository.save(product);
    return {
      id: product.id,
      message: 'Product media deleted!',
    };
  }
}
