import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Trabajador } from "./trabajador";
import { Empleador } from "./empleador";
import { Usuario } from "./usuario";
import { Pedido } from "./pedido";
import { Convenio } from "./convenio";

@Entity()
export class Entrevista extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    fechaEntrevista: Date;

    @Column()
    estado: string;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador)
    trabajador: Trabajador;

    @ManyToOne(() => Empleador, (empleador) => empleador)
    empleador: Empleador;

    @Column()
    eliminado: boolean;
    
    @Column({ nullable: true })
    observacion: string;

    @ManyToOne(() => Usuario, (usuario) => usuario.entrevista)
    usuario: Usuario;

    @ManyToOne(() => Pedido, (Pedido) => Pedido.entrevista)
    pedido: Pedido;

    @OneToOne(() => Convenio)
    @JoinColumn()
    convenio: Convenio;
}