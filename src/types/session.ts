/**
 * Represents the details of a Discord user session.
 *
 * @property discordId - The Discord user ID.
 * @property discordTag - The Discord tag (e.g., "username#1234").
 * @property avatar - The avatar URL or hash.
 * @property email - The user's email address.
 *
 * @example
 * const user: UserDetails = {
 *   discordId: "1234567890",
 *   discordTag: "user#1234",
 *   avatar: "avatarhash",
 *   email: "user@example.com"
 * };
 *
 * @see {@link https://discord.com/developers/docs/resources/user Discord User Resource}
 */
export type UserDetails = {
  discordId: string;
  discordTag: string;
  avatar: string;
  email: string;
};

/**
 * Represents OAuth2 authentication details for a Discord user.
 *
 * @property discordId - The Discord user ID.
 * @property accessToken - The OAuth2 access token.
 * @property refreshToken - The OAuth2 refresh token.
 *
 * @example
 * const oauth: OAuth2Details = {
 *   discordId: "1234567890",
 *   accessToken: "access-token",
 *   refreshToken: "refresh-token"
 * };
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2 OAuth2 Documentation}
 */
export type OAuth2Details = {
  discordId: string;
  accessToken: string;
  refreshToken: string;
};

/**
 * Parameters for finding a user in the session store.
 * All properties are optional.
 *
 * @property discordId - The Discord user ID.
 * @property discordTag - The Discord tag.
 * @property avatar - The avatar URL or hash.
 * @property email - The user's email address.
 *
 * @example
 * const params: FindUserParams = { discordId: "1234567890" };
 */
export type FindUserParams = Partial<{
  discordId: string;
  discordTag: string;
  avatar: string;
  email: string;
}>;

/**
 * Parameters for finding OAuth2 details in the session store.
 * All properties are optional.
 *
 * @property discordId - The Discord user ID.
 * @property accessToken - The OAuth2 access token.
 * @property refreshToken - The OAuth2 refresh token.
 *
 * @example
 * const params: FindOAuth2Params = { accessToken: "access-token" };
 */
export type FindOAuth2Params = Partial<{
  discordId: string;
  accessToken: string;
  refreshToken: string;
}>;

/**
 * Callback type for session completion.
 *
 * @param err - Error object if an error occurred, otherwise null.
 * @param user - The user object if authentication succeeded.
 *
 * @example
 * const done: Done = (err, user) => {
 *   if (err) throw err;
 *   console.log(user);
 * };
 *
 * @see {@link https://www.passportjs.org/docs/authenticate/ Passport.js Authenticate}
 */
export type Done = (err: any, user: any) => void;
