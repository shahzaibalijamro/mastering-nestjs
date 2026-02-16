import { User } from 'src/user/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

interface Picture {
  url: string;
  cloudinaryPublicId: string;
}

@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true, select: false })
  address: string;

  @Column({ length: 30, nullable: true, select: false })
  phoneNumber: string;

  @Column({ length: 50, nullable: true, select: false })
  idCardNumber: string;

  @Column({type: 'json', default: {
    url: "https://res.cloudinary.com/dacvedc6z/image/upload/v1771017447/wmremove-transformed_hnlfyc.png",
    cloudinaryPublicId : "wmremove-transformed_hnlfyc"
  }})
  picture: Picture;

  @OneToOne((type) => User, (user) => user.store, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' }) // ← ADD THIS
  owner: User;

  @OneToMany((type) => Product, (product) => product.store)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
