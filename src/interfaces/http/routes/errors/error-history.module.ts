import { Module } from "@nestjs/common";

import { ErrorHistoryController } from "./controllers/error-history.controller";
import { ErrorHistoryService } from "./error-history.service";

@Module({
  controllers: [ErrorHistoryController],
  providers: [ErrorHistoryService],
})
export class ErrorHistoryModule {}
