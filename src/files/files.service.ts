import { join } from 'path';//viene de nodejs
import { BadRequestException, Injectable } from '@nestjs/common';// viene de nest
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
    getStaticProductImage(imageName: string){
        const path = join(__dirname, '../../static/products', imageName);

        if (!existsSync(path)) throw new BadRequestException(`No product found with image ${imageName}`);
        
        return path;
    }
}
