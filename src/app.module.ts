import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { LoggerMiddleware } from './middlewares/logger.middlewares';

@Module({
  imports: [ProductsModule]
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      LoggerMiddleware
    ).forRoutes({
      method: RequestMethod.ALL,
      path: '*'
    })
  }
}
