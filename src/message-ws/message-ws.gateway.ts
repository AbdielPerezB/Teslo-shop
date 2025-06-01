import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Socket } from 'socket.io';

@WebSocketGateway({cors: true})
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect{
  constructor(private readonly messageWsService: MessageWsService) {

  }
  handleConnection(client: Socket) {
    console.log('client connected', client.id)
  }
  handleDisconnect(client: any) {
    console.log('client disconected', client.id)
    
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
 */
