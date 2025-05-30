import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid'; //Para validar si algo es uuid
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource//COmo viene de typeOrm, ya sabe cuál es nuetsra db


  ) {

  }

  //Recuerda que siempre las ocnexiones a db son asíncronas
  async create(createProductDto: CreateProductDto, user: User) {
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
      const { images = [], ...productDetails } = createProductDto

      //1 part
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),//1.1 part
        user,//para saber qué usurio creo el producto
      });
      await this.productRepository.save(product);
      return { ...product, images };//para no devolver el id de cada imagen
      /*NOTES 1 part:
      this.productRepository.create(createProductDto)
      Esto no inserta en la db, solo crea el objeto a insertar, ahora, perse a que createProductDto NO
      es exactamente igual a mi entity Product, si es "similar", this.productRepository.create(createProductDto)
      funciona si le pasas un objeto "similar" a la entity, los campos faltantes los rellena
      dependiendo de cómo creamos la entity y el dto.

      await this.productRepository.save(product)
      aquí si ya se envía el registro a la db

      1.1 part. Aquí aunque en nuestra entity de ProductImage definimos
      que cada instancia debe tener id y url, cuando ejecutamos  this.productImageRepository
      unicamente le estamos pasando el url y TypeORM INFIERE, el resto, es decir,
      como ya estamos "creando" la imagen dentro de un producto, de ahí infiere y jala el resto de datos

       */

    } catch (error) {
      this.handleDBExeptions(error)
    }

  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true, //esto es para que se muestre la relación de las imagenes, es decir, se devuelven las imagenes
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images?.map(img => img.url)

    }))
  }

  async findOne(term: string) {

    //Se puede buscar por id, slog y title
    let product: Product | null;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    }
    else {
      //si se está buscando por el slug. Pero en lugar de utilizar esto, utilizaremos un queryBUilder
      // product = await this.productRepository.findOneBy({slug:term})

      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //prod es el alias
      product = await queryBuilder
        .where(`UPPER(title)=:title or slug =:slug`, { title: term.toUpperCase(), slug: term.toLowerCase() })
        .leftJoinAndSelect('prod.images', 'prodIMages') //prod.images indica donde hacer el leftjoin, prodImages es el alias en el caso de que quisieramos hacer otro join con las imagenes
        .getOne();
      //Los dos puntos : significa que esas dos palabras, title y slug, son argumentos que yo le paso en el objeto
      //select algo * from Products where slug='XX' or title='xxx'

      //Nota: Una ventaja de utilizar typeORM es que esto ya deporsin nos protege de inyección SQL
      //Al utilizar UPPER(title), ya no estamos usando el index, hay que crear un index, esto ya es de postgres pero equis ahorita
    }
    if (!product) throw new NotFoundException(`Product with term ${term} not found`);

    /**
     * EAGER NOTES:
     * NOtas para utilizar eagle y mostrar las imagenes, queson el resultado de una relación:
     * Recordemos que este endpoint funciona buscando por UUID y por slug.
     * Cuando estamos buscando por UUID, basta con activar el eager en true en product.entity.ts
     * https://orkhan.gitbook.io/typeorm/docs/eager-and-lazy-relations
     * Perco cuando utilizamos el QueryBuilder, es necesario utilizar leftJoinAndSelect.
     * Todo está en la página de la documentación
    */

    return product

  }
  //Método apra aplanar las  imagenes:
  async findOnePlain(term: string){
    const {images = [], ...product} = await this.findOne(term);

    return {
      ...product,
      images: images.map(image => image.url)
    }

  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    //proload
    // busca un producto por el id y carga todas las demás propiedades (las de 
    // updateProductDto).
    //NOTA: Esto NO actualiza nada, solo prepara el producto que se va a insertar

    const {images, ...tuUpdate} = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...tuUpdate,
    });

    if (!product) throw new NotFoundException(`Product with ${id} not found`);

    //Tansacción, Query Runner
    /**
     * 3 Pasos que siempre debo hacer en un Query Runner:
     * 1. Hacer commit
     * 2. Hacer rollback
     * 3. Liberar al Query Runner
     */
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); //A partir de acá todo lo que hagamos estará en nuestro query runner

    try {
      if (images) {
        //borramos las imagenes anteriores 
        await queryRunner.manager.delete(ProductImage, {product:{id}})//productId 
        product.images = images.map(image => this.productImageRepository.create({url: image})) //Aquí aún no se están guardando las imagenes en la db
      } 
      // else{
      //   ??
      //   product.images???
      // }
      //siempre que yo uso en manager, aún no estoy imoactando la db

      product.user = user;//para que se sepa qué usuario actualizó el producto
      await queryRunner.manager.save(product)



      //Ya no se usa esta línea porque ahora estoy usando transacciones
      // await this.productRepository.save(product); //Nota: Solo en esta línea, aunque no pusiera el await y regrese una promesa, nest en automático espera a que se cumpla la promesa

      await queryRunner.commitTransaction();
      await queryRunner.release();//liberamos
      return this.findOnePlain(id);
    }
    catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release(); 
      this.handleDBExeptions(error)
    }
  }

  async remove(id: string) {
    //EL pipeuuterm ya hace la valtermación por automático si se envia otra cosa
    const { affected } = await this.productRepository.delete({ id })
    if (!affected) throw new BadRequestException(`Product with id ${id} not found`)

    /**
     * Otra forma sería utilizar una transacción pero en esta ocación utilizaremos eliminción en 
     * Esto es en product-image.entity en @ManyToOne()
     */

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

  //For dev mode only
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');//product es el alias
    try {
      return await query
          .delete()
          .where({})//no especificamos where para que borre toda la db
                    //como lo hizo Majo cuando borro todos los datos de su empresa JAJA 
          .execute();
      
    } catch (error) {
      this.handleDBExeptions(error);
      
    }
  }
}
