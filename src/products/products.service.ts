import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDTO, Product, UpdateProductDTO } from './products.model';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  getProducts(): Product[] {
    return this.products;
  }

  addProduct(body: CreateProductDTO): string {
    const id = Math.floor(Math.random() * 1000000).toString();
    const product = new Product(
      `${id}`,
      body.title,
      body.description,
      body.price,
    );
    this.products.push(product);
    return id;
  }

  getProductById(id: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  updateProductPut(id: string, body: CreateProductDTO): Product {
    const product = this.getProductById(id);

    product.title = body.title;
    product.description = body.description;
    product.price = body.price;

    return product;
  }

  updateProductPatch(id: string, body: UpdateProductDTO): Product {
    const product = this.getProductById(id);

    if (body.title !== undefined) product.title = body.title;
    if (body.description !== undefined) product.description = body.description;
    if (body.price !== undefined) product.price = body.price;

    return product;
  }

  deleteProduct(id: string): void {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException('Product not found');
    }
    this.products.splice(index, 1);
  }
}
