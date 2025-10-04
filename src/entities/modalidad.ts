import { BaseEntity, OneToMany, Column, PrimaryGeneratedColumn, Entity } from "typeorm";
import { Pedido } from "./pedido";
import { ModalidadTrabajador } from "./modalidadTrabajador";

@Entity()
export class Modalidad extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    descripcion: string;

    @Column({ nullable: true })
    eliminado: boolean;

    @OneToMany(() => Pedido, (pedido) => pedido.modalidad)
    pedidos: Pedido[]

    @OneToMany(() => ModalidadTrabajador, (ModalidadTrabajador) => ModalidadTrabajador.modalidad)
    modalidadTrabajador: ModalidadTrabajador[]
}