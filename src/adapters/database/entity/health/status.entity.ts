import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Represents the health status of the application.
 *
 * This entity is used to store and retrieve the health metrics of the application,
 * including error history, memory usage, CPU usage, and other relevant data.
 */
@Entity()
export class StatusEntity {
  /**
   * Unique identifier for the status entry.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Timestamp of the status check.
   */
  @Column()
  timestamp!: Date;

  /**
   * Memory usage in bytes.
   */
  @Column()
  memoryUsage!: number;

  /**
   * CPU usage percentage.
   */
  @Column()
  cpuUsage!: number;

  /**
   * Number of active errors recorded.
   */
  @Column()
  errorCount!: number;

  /**
   * Additional information about the health status.
   */
  @Column({ nullable: true })
  additionalInfo?: string;
}
