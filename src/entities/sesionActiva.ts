import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "./usuario";

@Entity()
export class SesionActiva extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Usuario)
    @JoinColumn()
    usuario: Usuario;

    @Column({ length: 255 })
    jwt: string;
    
    @Column({ length: 255 })
    device: string;
    
    @Column()
    creationDate: Date;
    
    @Column()
    expirationDate: Date;
}