import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Funciones } from "./funciones";
import { Pedido } from "./pedido";

@Entity()
export class FuncionesPedido extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => Funciones, (Funciones) => Funciones)
    funcion: Funciones;

    @ManyToOne(() => Pedido, (Pedido) => Pedido)
    pedido: Pedido;
}