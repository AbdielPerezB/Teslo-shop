import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {

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
    try {

      //Todo esto se hace mejor haciendo uso del @BeforeInsert en product.entity.ts
      // if(!createProductDto.slug){
      //   createProductDto.slug = createProductDto.title
      //   .toLocaleLowerCase()
      //   .replaceAll(' ', '_')
      //   .replaceAll("'", '')

      // }
      // else{
      //   createProductDto.slug = createProductDto.slug
      //   .toLocaleLowerCase()
      //   .replaceAll(' ', '_')
      //   .replaceAll("'", '')
      // }
      
      //1 part
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
      /*NOTES 1 part:
      this.productRepository.create(createProductDto)
      Esto no inserta en la db, solo crea el objeto a insertar, ahora, perse a que createProductDto NO
      es exactamente igual a mi entity Product, si es "similar", this.productRepository.create(createProductDto)
      funciona si le pasas un objeto "similar" a la entity, los campos faltantes los rellena
      dependiendo de cómo creamos la entity y el dto.

      await this.productRepository.save(product)
      aquí si ya se envía el registro a la db

       */

    } catch (error) {
      this.handleDBExeptions(error)
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

  private handleDBExeptions(error: any) { //aquí si de tipo any para manejar cualquier error
    if (error.code === '23505') //Ese código es único para el error de llava unique duplicada. Puedes ver el objeto error completo con console.log(error)
      throw new BadRequestException(error.detail)

    this.logger.error(error);
    throw new InternalServerErrorException(`Unexpected error, check server logs`)
    /**
     * NOTES del error:
     * Cuando enviamos datos a la db y esta no nos deja por alguna razón, como que se está repitiendo un 
     * dato unique o se está enviando un dato null que no debería ser null o algo así,
     * para validar nustras insersiones a la db NO ES CORRECTO hacer múltiples consultas a
     * la db para validar si dicho campo existe o no, si dicho número ya está ocupado o no, esto es 
     * mucho trabajo.
     * 
     * Una forma CORRECTA de hacerlo es examinar el error y utilizar el error, el código
     * del error y el datail del error que nuestra insersión o consulta fallida a la db
     * ya nos dio. esto es lo que estamos haciendo justo aquí.
     */
  }
}
