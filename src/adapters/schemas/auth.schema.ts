import { UserRole } from "#common/typeRole";
import z, { object } from "zod";

// Define a type for valid roles using keyof typeof UserRole
export type RolesValid = (typeof UserRole)[keyof typeof UserRole];

export const UserSchema = object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
});

export const UserLoginSchema = object({
  email: z.email(),
  password: z.string().min(6),
});

export const RoleSchema = object({
  uuid: z.uuid(),
  role: z.enum(Object.values(UserRole) as [RolesValid, ...RolesValid[]]),
});

export type UserSchemaType = z.infer<typeof UserSchema>;
export type UserLoginSchemaType = z.infer<typeof UserLoginSchema>;
export type RoleSchemaType = z.infer<typeof RoleSchema>;

export const RolesAdmin = ["admin", "moderator", "developer", "owner"]