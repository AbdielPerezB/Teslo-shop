import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({cors: true})
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect{

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService
  ) {}
  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload
    try {
      payload = this.jwtService.verify(token) //desifra el token
      await this.messageWsService.registerClient(client, payload.id);

    } catch(error){
      client.disconnect();
      return; //terminamos la ejecución del método

    }
    // console.log({payload})

    this.wss.emit('clients-updated', this.messageWsService.genCOnnectedClients())
  }
  handleDisconnect(client: any) {
    // console.log('client disconected', client.id)
    this.messageWsService.removeClient(client.id)
    // console.log({ clientesConnected: this.messageWsService.genCOnnectedClients() });

    this.wss.emit('clients-updated', this.messageWsService.genCOnnectedClients())
  }

  //message-from-client viene desde el cliente
  @SubscribeMessage('message-from-client') //eb ligar de hacer un wss.on
  handleMessageFromClient(client: Socket, payload: NewMessageDto){

    // Solo se envía al cliente que envío el mensaje
    // client.emit('messages-from-server', {
    //   fullname: 'soy yo',
    //   message: payload.message || 'no-message'
    // });

    //Envía a todos menos al cliente que lo emitio inicialmente
    // client.broadcast.emit('messages-from-server', {
    //   fullname: 'soy yo',
    //   message: payload.message || 'no-message'
    // });

    //Envía a todos y también al cliente inicial
    this.wss.emit('messages-from-server', {
      fullname: this.messageWsService.getUserFullNameBySocketId(client.id),
      message: payload.message || 'no-message'
    });


  }
}

/**
 * NOtas.
 * @WebSocketGateway({cors: true})
 * Cuando el cors está en true, esto significa que un cliente que esté en otro servidor,
 * como un front end, una app móvil u otro cosa, si va a poder conectarse a nuestro websocket.
 * Cuando un cliente está en la carpeta públic significa que está en el mismo servidor
 * y en la misma url. Pero usualmente, en el mundo real, el cliente, es decir, el frontend,
 * no se desarrolla aquí mismo, sino que se desarrolla en otro proyecto,
 * y es muy común que tenga otra url, otro puerto o que ese en otro servidor,
 * para eso se habilita el cors, para que se pueda conectar. (Checkar pdf de referencia para 
 * ver una poquita de configuración del websocket)
 * 
 * 
 * NOtas sobre sockets que no son propios de nest
 * Concepto de 'namespace':
 * El namespace es como el contexto, la sala, la habitación o la casa donde están los usuarios conectados.
 * Pueden haber un namespace de 'products' donde se traten temas específicos de productos,
 * y los usuarios pueden conectarse o desconectarse a ellos y solo escucharan la comunicación
 * del namespace al que se conecten. Existe el namespace de root.
 * 
 * Namespace personal. Cuando un usuario se conecta, se le asigna un id único (volatil porque
 * se regenera cuando abre y cierra el navegador por ejemplo), por eso se dice que cuando
 * un usuario se conecta se enchufa a 'dos' namespaces 'por defecto',
 * al namespace que se conecta, como productos por ejemplo y al namespace que corresponde a su
 * identificador único, en este namespace de su identificador único es al que el servidor
 * le envía mensajes que solo quiere que vea este usuario en particular
 * 
 * @WebSocketServer() wss: Server:
 * Tiene la infomación de todos los clientes conectados 
 * 
 * this.wss.emit('clients-updated', this.messageWsService.genCOnnectedClients())
 * el primer argumento es el key de lo que le enviamos al cliente y el segundo argumento es el
 * payload, que también podría ser un objeto {}.
 * Del lado del cliente, hacemos un:
 * socket.on('clients-updated', (clients: string[]) => {
 *      console.log({clients})
 *    });
 * para escuchar. clients: string[] es un arreglo de string porque this.messageWsService.genCOnnectedClients()
 * devuelve y envía un arreglo de string que son las ids
 * 
 * this.wss.emit()
 * Para hablar a los clientes 
 * 
 * this.wss.on()
 * Para escuchar, sin embargo, esto no tiene sentido escuchar desde el servidor porque
 * eso ya lo hace nestjs por nosotros. Para ello utilizamos @SubscribeMessage()
 * 
 * @SubscribeMessage('message-from-client')
 * Para escuchar mensajes del cliente, propio de nest. Con este decorador tenemos acceso a dos cosas:
 * 'client: Socket' es quien está emitiendo el mensaje y 'payload: any'.
 * 
 * handleMessageFromClient:
 * Aquí es donde podemos hacer la isnerción a la db, para ello y para muchas otras cosas sería
 * util que el método fuera async
 * 
 * Recuerda que también hay un wss.to, cliente.join, averiguar más
 * 
 * private readonly jwtService: JwtService:
 * Lo ideal sería poner esto en el messages-ws.service.ts, pero aquí la idea solo era ver los
 * conceptos por eso lo puse aquí
 * 
 * EN nest tenemos el throw new WsException('Invalid credentials.')
 * sin emabrgo, a fernano herrera no le gusta por lo tanto utilizamos el try catch

 */
