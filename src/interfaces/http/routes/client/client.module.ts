import { JwtConfigModule } from "#/core/jwt.module";
import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity } from "#entity/utils/licence.entity";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ClientService } from "./client.service";
import { ClientController } from "./controllers/client.controller";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, LicenseEntity]), JwtConfigModule, TypeOrmModule.forFeature([LicenseEntity])],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
