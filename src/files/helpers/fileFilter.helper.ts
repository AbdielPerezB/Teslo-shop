/**
 * Esta función está pensada para utilizarse en files.controller.ts -> FileInterceptor.
 * Por ello necesita cierta estructura.
 * NOTA: Ver la definición de fileFilter en files.controller.ts -> FileInterceptor dejando el cursos sobre ahí.
 * Esta es la definición:
 * (method) MulterOptions.fileFilter?(req: any, file: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}, callback: (error: Error | null, acceptFile: boolean) => void): void


 * La función aquí definida, solo se está pasando por referencia en files.controller.ts -> FileInterceptor, (la función de arriba descrita) 
 * eso quiere decir que el callback que no estamos definiendo aquí y otras cosas, están siendo manejadas
 * allá, no aquí, por eso tal vez no se le halle mucho sentido aquí a la función,
 * pero en el contexto de donde la estamos utilizando si hace sentido
 */

import { Request } from "express";

export const fileFIlter = (req: Request, file: Express.Multer.File, callback: Function) => {
    // console.log(file);
    //validamos el archivo
    if(!file) return callback(new Error(`File is empty`), false)
                        //si el callback regresa un false, significa que ahí se corta 
                        //todo y no se acepta el archivo, el archivo no pasa a la 
                        //siguiente fase ni nanais

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (validExtensions.includes(fileExtension)){
        return callback(null, true);
    }
    callback(null, false);

}