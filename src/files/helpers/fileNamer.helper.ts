import { Request } from "express";
import {v4 as uuid} from 'uuid';
/**
 * Esto es para asignar nombres a los archivos. utilizada en files.controller.ts ->
 * @UseInterceptors(FileInterceptor('file',{
     fileFilter: fileFIlter,
     storage: diskStorage({
       destination: './static/uploads',
       filename: fileNamer
     })
 */

export const fileNamer = (req: Request, file: Express.Multer.File, callback: Function) => {
    // if(!file) return callback(new Error(`File is empty`), false)
    //Aquí si o si ya hay un archivo por ello la validación de arriba es inecesaria

    const fileExtension = file.mimetype.split('/')[1];
    
    const fileName = `${uuid()}.${fileExtension}`;

    callback(null, fileName);

}