/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserEntity } from "#entity/users/user.entity";

//import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
//import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserCreatedListener {
  //private readonly logger = new Logger(UserCreatedListener.name);
  constructor() {}
  @OnEvent("user.created")
  handleUserCreatedEvent(_user: UserEntity) {}
}
