import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Store } from 'src/store/entities/store.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @Length(3, 40)
  username: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  password: string;

  @Column()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @OneToOne(
    type => Store, store => store.owner
  )
  store: Store;
}
