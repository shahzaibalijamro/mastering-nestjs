import { IsNotEmpty, IsString, Length } from "class-validator";
import { User } from "src/auth/entities/user.entity";
import { Product } from "src/products/entities/product.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
            eager: true
        }
    )
    owner: User;

    @OneToMany(
        type => Product, product => product.store
    )
    products: Product;
}