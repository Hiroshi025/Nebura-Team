import { TicketEntity } from "#entity/users/support/tickets.entity";
import { UserEntity } from "#entity/users/user.entity";
import { Server, Socket } from "socket.io";
import { Repository } from "typeorm";

import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
	OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer
} from "@nestjs/websockets";

/**
 * ChatGateway handles real-time chat events for support tickets using Socket.IO.
 *
 * @see https://docs.nestjs.com/websockets/gateways
 * @example
 * // Client emits a message to a ticket:
 * socket.emit("sendMessage", { ticketId: "123", message: "Hello!", userId: "abc" });
 */
@WebSocketGateway({
  cors: {
    origin: "*", // In production, specify your frontend domain
    methods: ["GET", "POST"],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /**
   * Called when a client connects to the WebSocket server.
   * @param client Socket instance
   * @see https://socket.io/docs/v4/server-api/#event-connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id} (${client.handshake.address})`);
  }

  /**
   * Called when a client disconnects from the WebSocket server.
   * @param client Socket instance
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Receives an event to send a message to a ticket (user).
   *
   * @event sendMessage
   * @param client Socket instance
   * @param data { ticketId: string, message: string, userId: string }
   * @example
   * socket.emit("sendMessage", { ticketId: "123", message: "Hello!", userId: "abc" });
   *
   * Emits:
   * - "messageSent": { success: boolean, message: string, msg?: object }
   */
  @SubscribeMessage("sendMessage")
  async handleSendMessage(client: Socket, data: { ticketId: string; message: string; userId: string }) {
    try {
      const user = await this.userRepo.findOne({ where: { uuid: data.userId } });
      if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

      const ticket = await this.ticketRepo.findOne({ where: { id: data.ticketId, userId: user.uuid } });
      if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

      const newMsg = {
        id: Math.random().toString(36).slice(2, 10),
        user: {
          id: user.uuid,
          discordId: user.discordInfo?.id || "",
          name: user.name || user.discordInfo?.username || "User",
          avatar: user.discordInfo?.avatar || "",
          role: user.role || "User",
          roleColor: "#43b581",
        },
        message: data.message,
        createdAt: new Date().toLocaleString(),
        attachments: [],
      };

      ticket.messages = Array.isArray(ticket.messages) ? ticket.messages : [];
      ticket.messages.push(newMsg);
      await this.ticketRepo.save(ticket);

      // Emit the message to the client
      client.emit("messageSent", { success: true, message: "Message sent successfully.", msg: newMsg });
      // Emitir a todos los clientes conectados para actualización en tiempo real
      this.server.emit("messageSentRealtime", { ticketUuid: ticket.uuid, msg: newMsg });
    } catch (err: any) {
      console.log(err);
      client.emit("messageSent", { success: false, message: err.message });
    }
  }

  /**
   * Receives an event to send a message to a ticket (admin).
   *
   * @event sendMessageAdmin
   * @param client Socket instance
   * @param data { ticketUuid: string, message: string, userId: string }
   * @example
   * socket.emit("sendMessageAdmin", { ticketUuid: "uuid-123", message: "Admin reply", userId: "admin-1" });
   *
   * Emits:
   * - "messageSentAdmin": { success: boolean, message: string, msg?: object }
   */
  @SubscribeMessage("sendMessageAdmin")
  async handleSendMessageAdmin(client: Socket, data: { ticketUuid: string; message: string; userId: string }) {
    try {
      const ticket = await this.ticketRepo.findOne({ where: { uuid: data.ticketUuid } });
      if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

      const user = await this.userRepo.findOne({ where: { uuid: ticket.userId } });
      if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

      const newMsg = {
        id: Math.random().toString(36).slice(2, 10),
        user: {
          id: user.uuid,
          discordId: user.discordInfo?.id || "",
          name: "Admin",
          avatar: user.discordInfo?.avatar || "",
          role: "Admin",
          roleColor: "#f04747",
        },
        message: data.message,
        createdAt: new Date().toLocaleString(),
        attachments: [],
      };

      ticket.messages = Array.isArray(ticket.messages) ? ticket.messages : [];
      ticket.messages.push(newMsg);
      await this.ticketRepo.save(ticket);

      client.emit("messageSentAdmin", { success: true, message: "Message sent successfully.", msg: newMsg });
      // Emitir a todos los clientes conectados para actualización en tiempo real
      this.server.emit("messageSentAdminRealtime", { ticketUuid: data.ticketUuid, msg: newMsg });
    } catch (err: any) {
      client.emit("messageSentAdmin", { success: false, message: err.message });
    }
  }

  /**
   * Receives an event to get messages from a ticket (user).
   *
   * @event getMessages
   * @param client Socket instance
   * @param data { ticketId: string, userId: string }
   * @example
   * socket.emit("getMessages", { ticketId: "123", userId: "abc" });
   *
   * Emits:
   * - "messages": { messages: object[], userId: string }
   */
  @SubscribeMessage("getMessages")
  async handleGetMessages(client: Socket, data: { ticketId: string; userId: string }) {
    try {
      const user = await this.userRepo.findOne({ where: { uuid: data.userId } });
      if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

      const ticket = await this.ticketRepo.findOne({ where: { id: data.ticketId, userId: user.uuid } });
      if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

      client.emit("messages", { messages: Array.isArray(ticket.messages) ? ticket.messages : [], userId: user.uuid });
    } catch (err: any) {
      client.emit("messages", { messages: [], error: err.message });
    }
  }

  /**
   * Receives an event to get messages from a ticket (admin).
   *
   * @event getMessagesAdmin
   * @param client Socket instance
   * @param data { ticketUuid: string }
   * @example
   * socket.emit("getMessagesAdmin", { ticketUuid: "uuid-123" });
   *
   * Emits:
   * - "messagesAdmin": { messages: object[], avatarUrl: string }
   * @see https://discord.com/developers/docs/reference#image-formatting
   */
  @SubscribeMessage("getMessagesAdmin")
  async handleGetMessagesAdmin(client: Socket, data: { ticketUuid: string }) {
    try {
      const ticket = await this.ticketRepo.findOne({ where: { uuid: data.ticketUuid } });
      if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

      const user = await this.userRepo.findOne({ where: { uuid: ticket.userId } });
      if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

      client.emit("messagesAdmin", {
        messages: Array.isArray(ticket.messages) ? ticket.messages : [],
        avatarUrl: `https://cdn.discordapp.com/avatars/${user.discordInfo?.id}/${user.discordInfo?.avatar}.png`,
      });
    } catch (err: any) {
      client.emit("messagesAdmin", { messages: [], error: err.message });
    }
  }
}
