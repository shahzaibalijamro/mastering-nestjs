import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { Product } from '../products/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartSummaryDto } from './dto/cart-summary.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getCartForUser(user: UserWithoutPassword): Promise<CartSummaryDto> {
    const cart = await this.getOrCreateCart(user.id);
    const items = await this.getCartItemsWithProducts(cart.id);
    return this.buildCartSummary(cart, items);
  }

  async addItem(
    user: UserWithoutPassword,
    body: AddCartItemDto,
  ): Promise<CartSummaryDto> {
    await this.ensureProductExists(body.productId);
    const cart = await this.getOrCreateCart(user.id);
    const quantityToAdd = body.quantity ?? 1;

    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId: body.productId,
      },
    });

    if (existingItem) {
      existingItem.quantity += quantityToAdd;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart: { id: cart.id } as Cart,
        product: { id: body.productId } as Product,
        quantity: quantityToAdd,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getCartForUser(user);
  }

  async updateItemQuantity(
    user: UserWithoutPassword,
    productId: string,
    body: UpdateCartItemDto,
  ): Promise<CartSummaryDto> {
    const cart = await this.getOrCreateCart(user.id);
    const item = await this.getCartItemOrThrow(cart.id, productId);
    item.quantity = body.quantity;
    await this.cartItemRepository.save(item);
    return this.getCartForUser(user);
  }

  async removeItem(
    user: UserWithoutPassword,
    productId: string,
  ): Promise<CartSummaryDto> {
    const cart = await this.getOrCreateCart(user.id);
    const item = await this.getCartItemOrThrow(cart.id, productId);
    await this.cartItemRepository.remove(item);
    return this.getCartForUser(user);
  }

  async clearCart(user: UserWithoutPassword): Promise<CartSummaryDto> {
    const cart = await this.getOrCreateCart(user.id);
    await this.cartItemRepository.delete({ cartId: cart.id });
    return this.getCartForUser(user);
  }

  private async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId } as User,
      });
      cart = await this.cartRepository.save(cart);
    }
    return cart;
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

  private async getCartItemOrThrow(
    cartId: string,
    productId: string,
  ): Promise<CartItem> {
    const item = await this.cartItemRepository.findOne({
      where: {
        cartId,
        productId,
      },
    });

    if (!item) {
      throw new NotFoundException('Product is not in cart');
    }
    return item;
  }

  private async getCartItemsWithProducts(cartId: string): Promise<CartItem[]> {
    return this.cartItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.product', 'product')
      .where('item.cartId = :cartId', { cartId })
      .select([
        'item.id',
        'item.cartId',
        'item.productId',
        'item.quantity',
        'item.createdAt',
        'item.updatedAt',
        'product.id',
        'product.name',
        'product.price',
        'product.media',
      ])
      .orderBy('item.createdAt', 'ASC')
      .getMany();
  }

  private buildCartSummary(cart: Cart, items: CartItem[]): CartSummaryDto {
    let totalAmountInCents = 0;
    let totalQuantity = 0;
    const updatedAt = items.reduce(
      (latest, item) => (item.updatedAt > latest ? item.updatedAt : latest),
      cart.updatedAt,
    );

    const mappedItems = items.map((item) => {
      const quantity = item.quantity;
      const unitPriceInCents = Math.round(Number(item.product.price) * 100);
      const subtotalInCents = unitPriceInCents * quantity;

      totalQuantity += quantity;
      totalAmountInCents += subtotalInCents;

      return {
        id: item.id,
        productId: item.productId,
        quantity,
        unitPrice: Number((unitPriceInCents / 100).toFixed(2)),
        subtotal: Number((subtotalInCents / 100).toFixed(2)),
        product: {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          media: item.product.media,
        },
      };
    });

    return {
      id: cart.id,
      items: mappedItems,
      totalItems: mappedItems.length,
      totalQuantity,
      totalAmount: Number((totalAmountInCents / 100).toFixed(2)),
      orderItems: mappedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      createdAt: cart.createdAt,
      updatedAt,
    };
  }
}
