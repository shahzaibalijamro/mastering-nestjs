import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Store } from 'src/store/entities/store.entity';
import { BeforeInsert, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER'
}

export enum signUpMethod {
  FORM = 'FORM',
  GOOGLE = 'GOOGLE'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsOptional()
  @Column({nullable: true})
  @IsString()
  googleId?: string;

  @Column()
  @IsNotEmpty()
  @IsEnum(signUpMethod)
  method: signUpMethod;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @Length(3, 40)
  username: string;

  @Column({unique: true})
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name: string;

  @IsOptional()
  @Column({select: false, nullable: true})
  @IsString()
  password?: string;

  @Column()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @OneToOne(
    type => Store, store => store.owner
  )
  store: Store;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  hashPassword(): void {
    if(this.password){
      this.password = bcrypt.hashSync(this.password, 10);
    }
  }
}
