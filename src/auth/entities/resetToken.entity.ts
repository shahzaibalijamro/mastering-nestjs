import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ResetToken {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    userId: string

    @Column()
    token: string

    @Column()
    expiresAt: Date 

    @Column({default: false})
    isUsed: boolean
}