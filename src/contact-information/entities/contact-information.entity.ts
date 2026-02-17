import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class ContactInformation {
  @ApiProperty({
    description: 'Unique identifier for the contact information.',
    example: 'b27fca1f-93f6-4bb8-894f-6c2c9a3b8c4e',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Full name of the contact.',
    example: 'Alex Johnson',
  })
  @Column()
  fullName: string;

  @ApiProperty({
    description: 'Phone number associated with the contact.',
    example: '+15555551234',
  })
  @Column({ length: 30 })
  phoneNumber: string;

  @ApiProperty({
    description: 'Primary address line of the contact.',
    example: '123 Market Street',
  })
  @Column({ type: 'text' })
  addressLine1: string;

  @ApiProperty({
    description: 'Secondary address line of the contact.',
    example: 'Apartment 12B',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  addressLine2?: string;

  @ApiProperty({
    description: 'City of the contact.',
    example: 'San Francisco',
  })
  @Column({ length: 120 })
  city: string;

  @ApiProperty({
    description: 'State or region of the contact.',
    example: 'CA',
  })
  @Column({ length: 120 })
  state: string;

  @ApiProperty({
    description: 'Postal or ZIP code.',
    example: '94105',
  })
  @Column({ length: 20 })
  postalCode: string;

  @ApiProperty({
    description: 'Country associated with the contact.',
    example: 'United States',
  })
  @Column({ length: 120 })
  country: string;

  @ManyToOne(() => User, (user) => user.contactInformation, {
    onDelete: 'CASCADE',
    eager: false,
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
