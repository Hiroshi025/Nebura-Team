import { IntegerOption } from "necord";

export class RemoveDto {
  @IntegerOption({
    name: "position",
    description: "Track position in the queue (starts at 1)",
    required: true,
    min_value: 1,
  })
  position!: number;
}
