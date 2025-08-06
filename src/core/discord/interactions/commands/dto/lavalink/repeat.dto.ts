import { StringOption } from "necord";

export class RepeatDto {
  @StringOption({
    name: "mode",
    description: "Repeat mode (track, queue, off)",
    required: true,
    choices: [
      { name: "Track", value: "track" },
      { name: "Queue", value: "queue" },
      { name: "Off", value: "off" },
    ],
  })
  mode!: string;
}
