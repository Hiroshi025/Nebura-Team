import z from "zod";

export const UuidSchema = z.uuid();
export type UuidType = z.infer<typeof UuidSchema>;
