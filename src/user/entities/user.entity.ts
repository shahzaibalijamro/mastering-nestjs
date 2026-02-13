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

  @Column({nullable: true})
  googleId?: string;

  @Column()
  method: signUpMethod;

  @Column({ unique: true })
  username: string;

  @Column({unique: true})
  email: string;

  @Column()
  name: string;

  @Column({select: false, nullable: true})
  password?: string;

  @Column()
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
