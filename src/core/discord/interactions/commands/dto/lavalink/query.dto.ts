import { IsString, Min } from "class-validator";
import { SearchPlatform } from "lavalink-client";
import { StringOption } from "necord";

export class QueryDto {
  @IsString()
  @Min(5)
  @StringOption({
    name: "query",
    description: "<name | url> of the requested track",
    required: true,
  })
  public readonly query!: string;

  @StringOption({
    name: "source",
    description: "source of the track",
    autocomplete: true,
    required: false,
  })
  public readonly source?: SearchPlatform;
}
