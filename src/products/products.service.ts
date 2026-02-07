import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType, Product } from './entities/product.entity';
import {
  CreateProductDTO,
  deleteMultipleProductsDTO,
  UpdateProductDTO,
  UpdateProductMediaDTO,
} from './dto/products.dto';
import { ConfirmationMsg } from '../utils/confirmation.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { formatCloudinaryMediaFiles } from 'src/utils/utils';
import { TagsService } from 'src/tags/tags.service';
import { TokenPayload } from 'src/auth/interfaces/user.interface';
import { User } from 'src/user/entities/user.entity';
import { StoreService } from 'src/store/store.service';
import { Tag } from 'src/tags/entities/tags.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly tagsService: TagsService,
    private readonly storeService: StoreService,
  ) {}

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      loadEagerRelations: false
    });
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
    const store = await this.storeService.getStoreByUser(user);

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
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
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
    await this.storeService.confirmProductInStore(user, product);

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

  async deleteProduct(id: string, user: User): Promise<ConfirmationMsg> {

    // confirm product exists
    const product = await this.getProductById(id);

    // confirm user owns the product
    await this.storeService.confirmProductInStore(user, product);

    // store id to return it later
    const productId = product.id;

    // delete
    await Promise.all(
      product.media.map((item) =>
        this.cloudinaryService.deleteFile(item.cloudinaryPublicId),
      ),
    );
    await this.productRepository.remove(product);

    // return id
    return {
      id: productId,
      message: 'Product deleted!',
    };
  }

  async deleteMultipleProducts(body: deleteMultipleProductsDTO, user: User) {
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
    await this.storeService.confirmProductInStore(user, product);

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
    await this.storeService.confirmProductInStore(user, product);

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
    await this.storeService.confirmProductInStore(user, product);

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
