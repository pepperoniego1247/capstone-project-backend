import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Trabajador } from "./trabajador";

@Entity()
export class UbicacionArchivo extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    descripcion: string;

    @OneToMany(() => Trabajador, (Trabajador) => Trabajador.ubicacionArchivo)
    trabajador: Trabajador[];
}