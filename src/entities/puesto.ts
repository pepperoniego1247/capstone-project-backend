import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pedido } from "./pedido";
import { Convenio } from "./convenio";
import { PuestoTrabajador } from "./puestoTrabajador";

@Entity()
export class Puesto extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    descripcion: string;

    @Column({ nullable: true })
    eliminado: boolean;

    @OneToMany(() => Pedido, (pedido) => pedido.puesto)
    pedidos: Pedido[]

    @OneToMany(() => PuestoTrabajador, (puestoTrabajador) => puestoTrabajador.puesto)
    puestoTrabajador: PuestoTrabajador[]

    @OneToMany(() => Convenio, (convenio) => convenio.puesto)
    Convenios: Convenio[]
}