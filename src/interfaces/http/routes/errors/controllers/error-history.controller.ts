/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

import { ErrorHistoryService } from "../error-history.service";

@Controller("error-history")
export class ErrorHistoryController {
  constructor(private readonly errorHistoryService: ErrorHistoryService) {}

  @Get()
  @ApiResponse({ status: 200, description: "Retrieve the error history." })
  async getErrorHistory() {
    return this.errorHistoryService.getErrorHistory();
  }
}
