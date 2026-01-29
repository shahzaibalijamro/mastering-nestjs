import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private cloudinaryService: CloudinaryService,
    private readonly tagsService: TagsService,
  ) {}

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async addProduct(
    body: CreateProductDTO,
    files: Array<Express.Multer.File>,
  ): Promise<ConfirmationMsg> {
    const { name, description, price, tagIds } = body;
    const UploadedFiles: UploadApiResponse[] =
      await this.cloudinaryService.uploadFiles(files);
      console.log(UploadedFiles);
      
    const media: Media[] = formatCloudinaryMediaFiles(UploadedFiles);
    const product = this.productRepository.create({
      description,
      price,
      name,
      media,
    });
    if (tagIds?.length > 0) {
      product.tags = await Promise.all(
        tagIds.map((id) => this.tagsService.findTagById(id)),
      );
    }
    await this.productRepository.save(product);
    return {
      id: product.id,
      message: 'Product added!',
    };
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
  ): Promise<ConfirmationMsg> {
    const { name, description, price, media } = body;
    const product = await this.getProductById(id);
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    await this.productRepository.save(product);
    return {
      id: product.id,
      message: 'Product updated!',
    };
  }

  async deleteProduct(id: string): Promise<ConfirmationMsg> {
    const product = await this.getProductById(id);
    const productId = product.id;
    await Promise.all(
      product.media.map((item) =>
        this.cloudinaryService.deleteFile(item.cloudinaryPublicId),
      ),
    );
    await this.productRepository.remove(product);
    return {
      id: productId,
      message: 'Product deleted!',
    };
  }

  async deleteMultipleProducts(body: deleteMultipleProductsDTO) {
    const { ids } = body;
    await Promise.all(ids.map((id) => this.deleteProduct(id)));
    return {
      message: `Product${ids.length === 1 ? '' : 's'} deleted!`,
    };
  }

  async updateProductMedia(
    id: string,
    body: UpdateProductMediaDTO,
    file: Express.Multer.File,
  ): Promise<ConfirmationMsg> {
    const { cloudinaryPublicId } = body;
    const product = await this.getProductById(id);
    if (!cloudinaryPublicId) {
      throw new BadRequestException(
        'cloudinaryPublicId is required for media updation!',
      );
    }
    const index = product.media.findIndex(
      (media) => media.cloudinaryPublicId === cloudinaryPublicId,
    );
    if (index === -1) {
      throw new NotFoundException('Media not found!');
    }
    const [_, uploadedFile] = await Promise.all([
      this.cloudinaryService.deleteFile(cloudinaryPublicId),
      this.cloudinaryService.uploadFile(file),
    ]);
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
  ): Promise<ConfirmationMsg> {
    const product = await this.getProductById(id);
    if (files.length > 10 - product.media.length) {
      throw new BadRequestException(
        `Products cannot have more than 10 media files!`,
      );
    }
    const UploadedFiles: UploadApiResponse[] =
      await this.cloudinaryService.uploadFiles(files);
    const media: Media[] = formatCloudinaryMediaFiles(UploadedFiles);
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
  ): Promise<ConfirmationMsg> {
    const product = await this.getProductById(id);
    if (product.media.length < 2) {
      throw new BadRequestException('Product must at least have one media!');
    }
    await Promise.all(
      cloudinaryPublicIds.map((id) => this.cloudinaryService.deleteFile(id)),
    );
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
