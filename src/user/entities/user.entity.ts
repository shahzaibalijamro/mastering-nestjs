import { Store } from 'src/store/entities/store.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ProductReview } from 'src/reviews/entities/reviews.entity';
import { Tag } from 'src/tags/entities/tags.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
}

export enum signUpMethod {
  FORM = 'FORM',
  GOOGLE = 'GOOGLE',
}

export interface ProfilePicture {
  url: string;
  cloudinaryPublicId?: string;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, select: false })
  googleId?: string;

  @Column({
    type: 'json',
    default: {
      url: 'https://res.cloudinary.com/dacvedc6z/image/upload/v1771087123/luxe_users_default_profilePicture_spanj5.png',
      cloudinaryPublicId: 'luxe_users_default_profilePicture_spanj5',
    },
  })
  profilePicture: ProfilePicture;

  @Column({select: false})
  method: signUpMethod;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({select: false})
  role: UserRole;

  @Column({ default: 1 , select: false})
  tokenVersion: number;

  @OneToOne((type) => Store, (store) => store.owner)
  store: Store;

  @OneToMany(type => ProductReview, (review) => review.user)
  reviews: ProductReview[];

  @ManyToMany(type => Tag, (tag) => tag.user)
  addedTags: Tag[];
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @BeforeInsert()
  hashPassword(): void {
    if (this.password) {
      this.password = bcrypt.hashSync(this.password, 10);
    }
  }
}
