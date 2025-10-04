import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Trabajador } from "./trabajador";

@Entity()
export class Folder extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    descripcion: string;

    @Column({ nullable: true })
    color: string;

    @Column({ nullable: true })
    codigo: string;

    @OneToMany(() => Trabajador, (Trabajador) => Trabajador.folder)
    trabajador: Trabajador[];
}