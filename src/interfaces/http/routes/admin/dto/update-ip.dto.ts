import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO for updating a blocked IP record.
 * Used to validate and transfer data for updating an IP block.
 */
export class UpdateIPBlockerDto {
  /**
   * Reason for updating the block status.
   */
  @ApiProperty({
    description: "Reason for updating the block status.",
    example: "Manual review.",
    required: false,
  })
  reason?: string;

  /**
   * Indicates if the block is currently active.
   */
  @ApiProperty({
    description: "Indicates if the block is currently active.",
    example: false,
    required: false,
  })
  isActive?: boolean;
}
