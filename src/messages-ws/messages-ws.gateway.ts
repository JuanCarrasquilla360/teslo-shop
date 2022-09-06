import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }


  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string
    let payload: JwtPayload

    try {
      payload = this.jwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id)
    } catch (err) {
      client.disconnect()
      console.error(err)
      return
    }
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id)
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client')
  onHandleMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log(client.id, payload)

    //! todos los clientes excepto el que lo mando
    // client.broadcast.emit('messages-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message'
    // })

    //! todos los clientes excepto el que lo mando
    this.wss.emit('messages-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message'
    })
  }

}
