import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/'
import { ProductImage } from './entities/'
@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature( //Aquí siempre es for Feature porque forRoot siempre solo hay uno
      [Product, ProductImage]
    )
  ]
})
export class ProductsModule {}
