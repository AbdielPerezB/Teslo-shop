import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User,
        // desktop: boolean,
        // mobile: boolean //Solamente si en un caso hipotético los requerimos
    }
}

@Injectable()
export class MessageWsService {

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
        //Esto gracias a que importamos el AuthModule y esto incluye el TYpeORM
    ){}

    async registerClient(client: Socket, userId: string){
        const user = await this.userRepository.findOneBy({id: userId})
        if(!user) throw new Error('User not found')
        if(!user.isActive) throw new Error('User not active')

            this.chekUserConnection(user);

        this.connectedClients[client.id] = {
            socket: client,
            user: user //viene de la db
        };
    }

    removeClient(clientId: string){
        delete this.connectedClients[clientId];
    }

    genCOnnectedClients(): string[] {
        //regresamos los ids de los clientes conectados 
        return Object.keys(this.connectedClients);
    }

    getUserFullNameBySocketId(socketId: string){
        return this.connectedClients[socketId].user.fullname;
    }

    private chekUserConnection(user: User){
        for (const clientId of Object.keys(this.connectedClients)) {

            const connectedClient = this.connectedClients[clientId];

            if (connectedClient.user.id === user.id ){
                connectedClient.socket.disconnect();
                break;
            }
            
        }
    }

}
/**
 * Aquí vamos a implementar un lugar donde voy a identificar todas las conexiones
 * de los clientes al socket, TODA la información.
 * 
 * La razón de que en registerClient(client: Socket) utlizamos un cliente: Socket
 * y en  removeClient(clientId: string) utilizamos solo su id, nos es más que para ejemplificar 
 * dos maneras de hacer lo mismo
 * 
 * interface ConnectedClients {
 *     [id: string]: {
 *         socket: Socket,
 *         user: User
 *     }
 * }
 * Esto está echo aquí para fines didácticos, todos estos usuarios se están guardando en memoria
 * del servidor, ahorita esta bien para fines didácticos, pero cuando ya hay muchísimos usuarios
 * valdría la pena guardarlo en una db. Pero queda pendiente checar pruebas de estrés
 * 
 * 
 * chekUserConnection(user: User):
 * Este método unicamente sirve para verificar que no haya dos conexiones del mismo usuario
 * para este caso en particular. Otros requerimientos podrían permitir la conexión del mismo
 * usuario varias veces, pero en esta ocación no lo permitiremos
 */