import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Puesto } from "./puesto";
import { Trabajador } from "./trabajador";

@Entity()
export class PuestoTrabajador extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Puesto, (puesto) => puesto)
    puesto: Puesto;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador)
    trabajador: Trabajador;
}