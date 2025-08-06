import { IntegerOption } from "necord";

export class VolumeDto {
  @IntegerOption({
    name: "amount",
    description: "Volume amount (0-1000)",
    required: true,
    min_value: 0,
    max_value: 1000,
  })
  amount!: number;
}
