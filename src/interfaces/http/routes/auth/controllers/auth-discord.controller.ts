import { AuthenticatedGuard, DiscordAuthGuard } from "#common/guards/auth-discord.guard";
import { Request, Response } from "express-serve-static-core";

import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiExcludeEndpoint } from "@nestjs/swagger";

@Controller({
  path: 'auth/discord',
})
export class AuthDiscordController {
  @Get('redirect')
  @UseGuards(DiscordAuthGuard)
  @ApiExcludeEndpoint()
  redirect(@Res() res: Response) {
    return res.redirect('/dashboard');
  }


  @Get('login')
  @UseGuards(DiscordAuthGuard)
  @ApiExcludeEndpoint()
  login() {
    return { msg: 'Login' };
  }

  @Get('status')
  @UseGuards(AuthenticatedGuard)
  @ApiExcludeEndpoint()
  status(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  @ApiExcludeEndpoint()
  logout() {
    return {};
  }
}