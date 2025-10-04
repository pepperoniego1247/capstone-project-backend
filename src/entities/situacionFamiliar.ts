import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Trabajador } from "./trabajador";

@Entity()
export class SituacionFamiliar extends BaseEntity{
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    dni: string;

    @Column()
    nombreFamiliar: string;

    @Column()
    apellidoPaternoFamiliar: string;

    @Column()
    apellidoMaternoFamiliar: string;

    @Column()
    edadFamiliar: number;

    @Column()
    relacionFamiliar: string;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador)
    trabajador: Trabajador;
}