import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empleador } from "./empleador";
import { Trabajador } from "./trabajador";
import { Modalidad } from "./modalidad";
import { Puesto } from "./puesto";
import { HorarioPedido } from "./horarioPedido";
import { FuncionesPedido } from "./funcionesPedido";
import { Usuario } from "./usuario";
import { Entrevista } from "./Entrevista";

@Entity()
export class Pedido extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    edadMinima: number;

    @Column()
    edadMaxima: number;

    @Column()
    rutina: string;

    @Column()
    observaciones: string;

    @Column()
    estado: string;

    @Column()
    movilidad: string;

    @Column()
    horasSemanales: number;

    @Column()
    sueldo: number;

    @Column()
    cantAdultos: number;

    @Column()
    eliminado: boolean;

    @Column()
    cantNiños: number;

    @Column()
    mascotas: boolean;

    @Column({ nullable: true })
    tipoDomicilio: string;
    
    @Column({ nullable: true })
    periocidad: string;

    //* COLOCACION, REEMPLAZO1, REEMPLAZO2 Y REEMPLAZO EXTRAORDINARIO
    @Column({ nullable: true })
    estadoPedido: string;

    @Column({ nullable: true })
    tipoEntrevista: string;

    @Column()
    ordenDeServicio: boolean;

    @Column()
    cantPisos: number;

    @Column({ nullable: true })
    fechaInicio: Date;

    @Column({ nullable: true })
    fechaRegistro: Date;

    @ManyToOne(() => Empleador, (empleador) => empleador)
    empleador: Empleador;

    @ManyToOne(() => Modalidad, (modalidad) => modalidad)
    modalidad: Modalidad;

    @ManyToOne(() => Puesto, (puesto) => puesto)
    puesto: Puesto;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador)
    trabajador: Trabajador;

    @OneToMany(() => FuncionesPedido, (FuncionesPedido) => FuncionesPedido.pedido)
    funcionesPedido: FuncionesPedido[];

    @OneToOne(() => HorarioPedido)
    @JoinColumn()
    horarioPedido: HorarioPedido;

    @ManyToOne(() => Usuario, (usuario) => usuario.pedido)
    usuario: Usuario;

    @OneToMany(() => Entrevista, (Entrevista) => Entrevista.pedido)
    entrevista: Entrevista[];
}