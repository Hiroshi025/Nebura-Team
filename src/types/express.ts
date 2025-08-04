import { Request } from "express-serve-static-core";

/**
 * Extends the Express {@link Request} interface to include a `user` property.
 * This is typically used for authenticated requests where user information is attached to the request object.
 *
 * @property user - An object containing the authenticated user's ID.
 *
 * @example
 * // Usage in a route handler:
 * import { RequestClient } from "./types/express";
 *
 * app.get("/profile", (req: RequestClient, res) => {
 *   const userId = req.user.id;
 *   res.send(`User ID: ${userId}`);
 * });
 *
 * @see {@link https://expressjs.com/en/api.html#req Express Request API}
 */
export interface RequestClient extends Request {
  user: {
    id: string;
  };
}
