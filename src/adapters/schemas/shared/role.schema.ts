import { UserRole } from "#common/typeRole";
import z from "zod";

import { RolesValid } from "../auth.schema";

export const RoleValidSchema = z.object({
  role: z.enum(Object.values(UserRole) as [RolesValid, ...RolesValid[]]),
});

export type RoleValidSchemaType = z.infer<typeof RoleValidSchema>;
