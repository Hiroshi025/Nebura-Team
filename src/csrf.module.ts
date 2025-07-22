/* eslint-disable @typescript-eslint/no-unsafe-return */
import { doubleCsrf } from "csrf-csrf";
import { NextFunction, Request as ExpressRequest, Response } from "express";

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

// Optionally extend ExpressRequest if needed, but not required for csrf-csrf usage
// interface SessionRequest extends ExpressRequest {
//   session?: { id?: string };
//   ip: string;
// }

@Module({})
export class CsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const doubleCsrfOptions = {
      getSecret: () => process.env.CSRF_SECRET || "default_csrf_secret",
      cookieName: "__Host-csrfToken",
      cookieOptions: {
        httpOnly: true,
        path: "/",
      },
      requestTokenName: "x-csrf-token",
      ignoreMethods: ["GET", "HEAD", "OPTIONS"],
      getSessionIdentifier: (req: ExpressRequest): string =>
        // @ts-expect-error: session may be added by session middleware
        req.session?.id ?? req.ip ?? "",
    };

    const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf(doubleCsrfOptions);

    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        if (doubleCsrfOptions.ignoreMethods.includes((req as any).method)) return next();
        generateCsrfToken(req, res);
        next();
      }, doubleCsrfProtection)
      .forRoutes("*");
  }
}
