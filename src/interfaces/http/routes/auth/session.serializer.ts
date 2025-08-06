import { Done } from "#/types/sessions-types";
import { UserEntity } from "#entity/users/user.entity";
import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";

export class SessionSerializer extends PassportSerializer {
  private readonly logger = new Logger(SessionSerializer.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
  ) {
    super();
  }
  serializeUser(user: any, done: Done) {
    this.logger.debug(`Serializing user: ${user.id} - ${user.username}`);
    done(null, user);
  }
  async deserializeUser(user: any, done: Done) {
    const userDB = await this.authRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: user.id })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    this.logger.debug(`Deserializing user: ${user.id} - ${user.username}`);
    return userDB ? done(null, user) : done(null, null);
  }
}
