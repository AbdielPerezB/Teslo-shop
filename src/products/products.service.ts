import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){

  }

  //Recuerda que siempre las ocnexiones a db son asíncronas
  async create(createProductDto: CreateProductDto) {
    /*
    En lugar de crear el producto de esta forma:
    const product = new Product()
    Es mejor, recomendable y best usar el patrón repositorio. 
    Cuando utilicemos transacciones para hacer modificaciones a múltiples tablas, el patrón
    repositorio nos ayudará mucho, y en general cuando hagas tus insersiones a db, utiliza el 
    patrón repositorio.
    Algo genial es que la gente de Nest y TypeORM ya lo provee. Eso es lo que hacemos en el constructor con:
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
    */
    try{
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;

      /*NOTES:
      this.productRepository.create(createProductDto)
      Esto no inserta en la db, solo crea el objeto a insertar, ahora, perse a que createProductDto NO
      es exactamente igual a mi entity Product, si es "similar", this.productRepository.create(createProductDto)
      funciona si le pasas un objeto "similar" a la entity, los campos faltantes los rellena
      dependiendo de cómo creamos la entity y el dto.

      await this.productRepository.save(product)
      aquí si ya se envía el registro a la db

       */


    } catch(error) {
      console.log(error)
      throw new InternalServerErrorException('Ayuda')
    }

  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
