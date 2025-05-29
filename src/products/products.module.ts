import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/'
import { ProductImage } from './entities/'
import { AuthModule } from 'src/auth/auth.module';
@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature( //Aquí siempre es for Feature porque forRoot siempre solo hay uno
      [Product, ProductImage]
    ),
    AuthModule
  ],
  exports: [
    ProductsService,
    TypeOrmModule,//Es bastante comun que se exporte el type para que 
                  //en otros componentes podamos utilizar Product y ProductImage
  ]
})
export class ProductsModule {}
