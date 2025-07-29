import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO for creating a blocked IP record.
 * Used to validate and transfer data for blocking an IP address.
 */
export class CreateIPBlockerDto {
  /**
   * The IP address to block.
   */
  @ApiProperty({
    description: "The IP address to block.",
    example: "192.168.1.100",
  })
  ipAddress!: string;

  /**
   * Reason for blocking the IP address.
   */
  @ApiProperty({
    description: "Reason for blocking the IP address.",
    example: "Suspicious activity detected.",
    required: false,
  })
  reason?: string;
}
