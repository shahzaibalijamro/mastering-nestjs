import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Store } from 'src/store/entities/store.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

enum UserRole {
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
  @Transform(({ value }) => value.toLowerCase())
  @Length(3, 15)
  username: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @Length(3, 25)
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
    type => Store, store => store.owner, {
        eager: true
    }
  )
  store: Store;
}
