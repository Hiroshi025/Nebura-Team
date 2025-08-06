import { IntegerOption } from "necord";

export class SeekDto {
  @IntegerOption({
    name: "position",
    description: "Seek position in seconds",
    required: true,
    min_value: 0,
  })
  position!: number;
}
