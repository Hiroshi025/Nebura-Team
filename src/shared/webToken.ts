import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";

/**
 * Generates a JSON Web Token (JWT) for the given payload.
 *
 * @param {object} payload - The payload to sign (e.g., { sub, username, role }).
 * @returns {string} The signed JWT.
 * @throws {ServerError} If the JWT secret is not provided.
 *
 * @example
 * const token = signToken({ sub: 1, username: "user@example.com", role: "admin" });
 * console.log(token);
 */
export const signToken = (payload: object): string => {
  if (!process.env.JWT_SECRET)
    throw new NotFoundException("No JWT secret provided", {
      cause: new Error("JWT_SECRET is not defined in environment variables"),
      description: "Ensure that JWT_SECRET is set in your environment variables",
    });

  const jwt = sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return jwt;
};
/**
 * Validates a given JSON Web Token (JWT).
 *
 * @param {string} jwt - The JWT to validate.
 * @returns {string | object} Returns the decoded token if valid, or "not_auth" if invalid.
 *
 * @example
 * const tokenData = await getToken("your.jwt.token");
 * if (tokenData === "not_auth") {
 *   console.log("Token is invalid or expired");
 * } else {
 *   console.log("Token is valid:", tokenData);
 * }
 */
export const getToken = (jwt: string): string | object => {
  if (!process.env.JWT_SECRET) throw new HttpException("No JWT secret provided", HttpStatus.NOT_FOUND);
  if (!jwt) return "not_auth";

  const isOK = verify(jwt, process.env.JWT_SECRET);
  if (!isOK) return "not_auth";

  return isOK;
};

/**
 * Encrypts a password using bcrypt with a salt round of 8.
 *
 * @param {string} pass - The plain text password to encrypt.
 * @returns {Promise<string>} The hashed password.
 *
 * @example
 * const hashedPassword = await encrypt("my_secure_password");
 * console.log(hashedPassword);
 */
export const encrypt = async (pass: string): Promise<string> => {
  const passwordHash = await hash(pass, 8);
  return passwordHash;
};

/**
 * Verifies a plain text password against a hashed password.
 *
 * @param {string} pass - The plain text password.
 * @param {string} passHash - The hashed password to compare against.
 * @returns {Promise<boolean>} Returns `true` if the password matches, otherwise `false`.
 *
 * @example
 * const isValid = await verified("my_secure_password", hashedPassword);
 * console.log(isValid); // true or false
 */
export const verified = async (pass: string, passHash: string): Promise<boolean> => {
  const isCorrect = await compare(pass, passHash);
  return isCorrect;
};
