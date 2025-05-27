import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFIlter } from './helpers';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) { }

  @Post('product')
  //Intercepta el file. FileInterceptor solo funciona si utilizo Express de fondo. file es la key del archivo en Bruno
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: fileFIlter,
    // limits: {fileSize: 1025 *1024 *50} //50 mb de límite por archivo. Además pordemos agregar otras cosas
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File //Acepta todo tipo de archivo, pdf, img, etc. En este endpoint en particular a continuación validaremos que olo se admitan imagenes
  ){

    if (!file) throw new BadRequestException(`Make sure that the file is an image`)

    // const secureUrl = `${file.filename}`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
      
    return {
      secureUrl
    }
  }

  @Get('product/:imageName') //también podría ser :type/:imageName, para que no solo sean productos
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ){

    const path = this.filesService.getStaticProductImage(imageName);
    // return imageName;
    // res.status(403).json({
    //   ok: false,
    //   path
    // })

    res.sendFile(path);

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
 * 
 * 
 * NOTAS DE @Res() res: Response :
 * Cuando yo utilizo este decorador le estoy diciendo a nest:
 * "No quiero que tú manejes la respuesta, yo manualmente voy a manejar la respuesta"
 * Recordemos que nest está escrito sobre Express.
 * Ten cuidado cuando lo utilices porque de esta manera te saltas filtros, cosas globales
 * y algunas seguridades que ya incluye Nest
 */
