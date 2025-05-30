import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  async runSeed(){
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'Seed executed';


  }

  private async insertUsers(){
    //Esta es otra manera de hacerlo a diferencia de insertNewProducts
    const seedUsers = initialData.users;

    // insert into users
    const users: User[] = [];

    seedUsers.forEach (user => {
      users.push(this.userRepository.create(user))
    });

    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0]

  }

  private async deleteTables(){

    //Eliminamos productos. Como tenemos cascade en los productos, esto también borra las imgs
    await this.productService.deleteAllProducts();

    //Eliminamos usuarios
    const queyBuilder = this.userRepository.createQueryBuilder();
    await queyBuilder
    .delete()
    .where({}) //Borramos toda la db así como le hizo Majo jaja
    .execute()

  }

  private async insertNewProducts(user: User){

    await this.productService.deleteAllProducts();

    const products = initialData.products;
    const insertPromises: Promise<any>[] = []

    products.forEach(product => {
      insertPromises.push(this.productService.create(product, user))
    });

    await Promise.all(insertPromises);

    return true;
  }
}

/**
 * NOTAS DEL SEED:
 * 1. El seed es solo para producción, sirve para cargar datos a la db de ejemplo para trabajar
 * en desarrollo, cuando pasamos a producción, estos datos se cargan de forma manual.
 * Este seed lo que hace a ejecutarlo es que primero borra todos los datos de la db,
 * usuarios, productos e imagenes, y después pobla la base de datos con datos para desarrollo.
 * Usuarios, imágenes y productos. NOta: ver see-data.ts para ver los datos con los que se 
 * pobla la db al utilizar esta semilla
 * 
 * 2. Hay que hacer bien el procedimiento para borrar los datos de la db en el seed, ya que,
 * por ejemplo, si se trata de borrar un usuario y este usuario tiene productos asignados
 * en la db, al intenatr borrar el usuario se dañaría la integridad referencial de la db y esto nos
 * arrojaría un error como el de table plus de:
 * ERROR: update or delete on table "Users" violates foreing key constraint "FGHJ..."
 * on table "products".
 * Por ello se utiliza deleteTables()
 * 
 * 3. Debido a que el método de añadir un nuevo usuario, requiere que este autenticado
 * por un token de un usuario, es decir, que se le envie un usuario que ya exista en la db, primero
 * creamos usuarios en la db los insertamos, y luego utilizanos uno de esos usuarios para
 * con sus credenciales, insertar productos en el seed. Nota: ver seed-data.ts para ver las
 * interfaces y el initialData
 */
