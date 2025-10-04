import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Modalidad } from "./modalidad";
import { Trabajador } from "./trabajador";

@Entity()
export class ModalidadTrabajador extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Modalidad, (modalidad) => modalidad)
    modalidad: Modalidad;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador)
    trabajador: Trabajador;
}