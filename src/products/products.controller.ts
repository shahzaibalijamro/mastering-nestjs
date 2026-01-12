import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDTO, Product, UpdateProductDTO } from './products.model';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  getProducts(): Product[] {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string): Product {
    return this.productsService.getProductById(id);
  }

  @Post()
  addProduct(@Body() body: CreateProductDTO): string {
    return this.productsService.addProduct(body);
  }

  @Put(':id')
  updateProductPut(
    @Param('id') id: string,
    @Body() body: CreateProductDTO,
  ): Product {
    return this.productsService.updateProductPut(id, body);
  }

  @Patch(':id')
  updateProductPatch(
    @Param('id') id: string,
    @Body() body: UpdateProductDTO,
  ): Product {
    return this.productsService.updateProductPatch(id, body);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    this.productsService.deleteProduct(id);
    return { message: 'Product deleted' };
  }
}
