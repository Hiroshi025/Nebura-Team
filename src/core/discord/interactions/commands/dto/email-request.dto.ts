import { IsEmail } from "class-validator";
import { StringOption } from "necord";

export class TextDto {
  @IsEmail()
  @StringOption({
    name: "email",
    description: "The email you used to register in the project",
    required: true,
  })
  email!: string;
}
