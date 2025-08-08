/**
 * TasksModule provides scheduled task functionality.
 * It registers controllers and services for handling background jobs such as notification purging and IP logging.
 * Uses TypeORM for database access.
 * @see https://docs.nestjs.com/modules
 * @example
 * // Import TasksModule in your AppModule:
 * import { TasksModule } from './interfaces/http/routes/tasks/tasks.module';
 * @module TasksModule
 */
import { IPBlockerEntity } from "#entity/admin/ips-blocker.entity";
import { UserEntity } from "#entity/users/user.entity";
import { NotificationEntity } from "#entity/utils/tools/notification.entity";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TasksController } from "./controllers/tasks.controller";
import { TasksService } from "./service/tasks.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, IPBlockerEntity, NotificationEntity])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
