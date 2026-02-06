import { IsNotEmpty, IsString, Length } from "class-validator";
import { User } from "src/user/entities/user.entity";
import { Product } from "src/products/entities/product.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    @IsNotEmpty()
    @IsString()
    @Length(3, 50)
    name: string;

    @Column({type: 'text'})
    @IsNotEmpty()
    @IsString()
    description: string;

    @OneToOne(
        (type) => User, (user) => user.store, {
            eager: true,
            onDelete: 'CASCADE'
        }
    )
    @JoinColumn({name: 'ownerId'})  // ← ADD THIS
    owner: User;

    @OneToMany(
        type => Product, product => product.store
    )
    products: Product[];
    
      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;
}