import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";
//NOta, recuerda que nosotros podemos ser tan estrictos como queramos en nuesros DTO
export class CreateProductDto {
    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;
    
    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({each: true})//Como es un string, cada elemento debe cumplir la condición de que es string
    @IsArray()
    sizes: string[];

    @IsString()
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @IsString({each:true})
    @IsArray()
    @IsOptional()//Se tiene que definir explicitamente que es opcional, también cuida que tenga un default en la entity
    tags?: string[];
    
}
