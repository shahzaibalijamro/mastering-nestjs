import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../Entities/product.entity';
import { CreateProductDTO } from '../DTOs/product.dto';

@Injectable()
export class ProductsService {
  private products: Product[] = [];
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async addProduct(body: CreateProductDTO): Promise<string> {
    const { name, description ,price } = body;
    const product = await this.productRepository.save({
      description,
      price,
      name,
    });
    return product.id;
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

  // updateProductPut(id: string, body: CreateProductDTO): Product {
  //   const product = this.getProductById(id);

  //   product.title = body.title;
  //   product.description = body.description;
  //   product.price = body.price;

  //   return product;
  // }

  // updateProductPatch(id: string, body: UpdateProductDTO): Product {
  //   const product = this.getProductById(id);

  //   if (body.title !== undefined) product.title = body.title;
  //   if (body.description !== undefined) product.description = body.description;
  //   if (body.price !== undefined) product.price = body.price;

  //   return product;
  // }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);
    await this.productRepository.remove(product);
  }
}
