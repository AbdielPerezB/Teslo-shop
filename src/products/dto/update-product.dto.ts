// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

/**
 * En lugar de importar de @nestjs/mapped-types, importamos
 * de @nestjs/swagger para que swagger agarre la documentación. Esto no afecta en nada a lo demas 
 */