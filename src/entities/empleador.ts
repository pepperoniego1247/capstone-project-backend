import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Persona } from "./persona";
import { Convenio } from "./convenio";
import { Entrevista } from "./Entrevista";
import { Pedido } from "./pedido";
import { Usuario } from "./usuario";

@Entity()
export class Empleador extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column({ nullable: true })
    correo: string;

    @Column({ nullable: true })
    transportePublico: string;

    @Column({ nullable: true })
    excluido: boolean;

    @Column({ nullable: true })
    quienRefirio: string;

    @Column()
    eliminado: boolean;

    @Column({ nullable: true })
    fotoUrl: string;

    @Column({ nullable: true })
    observacion: string;

    @OneToOne(() => Persona)
    @JoinColumn()
    persona: Persona;

    @ManyToOne(() => Usuario, (usuario) => usuario.empleador)
    usuario: Usuario;

    @OneToMany(() => Convenio, (convenio) => convenio.empleador)
    convenios: Convenio[];

    @OneToMany(() => Entrevista, (entrevista) => entrevista.empleador)
    entrevistas: Entrevista[];

    @OneToMany(() => Pedido, (Pedido) => Pedido.empleador)
    pedidos: Pedido[];
}