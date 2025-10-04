import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Trabajador } from "./trabajador";

@Entity()
export class VerificacionVeracidad extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    // Datos de Veracidad
    @Column()
cargoQueDesempenaba: string;

@Column()
funcionesQueDesempenaba: string;

@Column()
tiempoDeTrabajo: string;

@Column()
fechaDeTrabajo: string;

@Column()
zonaDeTrabajo: string;

@Column()
sueldoQueGanaba: number;

@Column()
porqueDejoDeTrabajar: string;

    @OneToOne(() => Trabajador)
    @JoinColumn()
    trabajador: Trabajador;
}
