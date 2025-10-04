import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Persona } from "./persona";
import { Trabajador } from "./trabajador";
import { Usuario } from "./usuario";

@Entity()
export class Cita extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    fechaCita: Date

    @Column()
    estado: string

    @ManyToOne(() => Persona, (persona) => persona.citas)
    persona: Persona;

    @Column({ nullable: true })
    asistida: boolean;

    @Column()
    eliminado: boolean;
    
    @Column({ nullable: true })
    observacion: string;

    @ManyToOne(() => Usuario, (usuario) => usuario.cita)
    usuario: Usuario;
}