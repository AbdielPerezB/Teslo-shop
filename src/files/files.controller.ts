import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFIlter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('product')
  //Intercepta el file. FileInterceptor solo funciona si utilizo Express de fondo. file es la key del archivo en Bruno
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: fileFIlter
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File //Acepta todo tipo de archivo, pdf, img, etc. En este endpoint en particular a continuación validaremos que olo se admitan imagenes
  ){

    if (!file) throw new BadRequestException(`Make sure that the file is an image`)
      
    return {
      filename: file.originalname
    }
  }


}
/**
 * NOTAS DE SEGURIDAD AL MANEJAR ARCHIVOS:
 * Si la aplicación está pensada para hacerse pública a miles de usuarios, nunca es recomendable
 * guardar las imagenes en el filesystem, es decir, en el mismo lugar donde está nuestro código fuente.
 * Ya que alguien podría enviar archivos maliciosos y exponer nestro directorio,
 * las variables de entorno o siemplemente ehcarnos abajo la aplicación. Por seguridad, hay que guardar 
 * los archivos en un servicio de terceros como un bucket de AWS o un Claude.
 * 
 * Si la app está pensada solo para uso internos, puede ser que no haya mucho problema
 * en guardar los archivos en el filesystem
 */
