import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../Entities/product.entity';
import { CreateProductDTO, UpdateProductDTO } from '../DTOs/product.dto';
import { ConfirmationMsg } from '../Interfaces/confirmation.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async addProduct(body: CreateProductDTO): Promise<ConfirmationMsg> {
    const { name, description, price, media } = body;
    const product = await this.productRepository.save({
      description,
      price,
      name,
      media,
    });
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

  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);
    await this.productRepository.remove(product);
  }
}
