import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { VerificacionVeracidad } from "./verificacionVeracidad";

@Entity()
export class HerenciaVeracidadReferencia extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    funciones: string;

    @Column()
    cargoDesempenado: string;

    @Column()
    zonaDeTrabajdo: string;

    @Column()
    motivoCese: string;

    @Column()
    tiempoTrabajo: string;

    @Column()
    salario: number;

    @OneToOne(() => VerificacionVeracidad)
    @JoinColumn()
    verificacionVeracidad: VerificacionVeracidad;

    @OneToOne(() => VerificacionVeracidad)
    @JoinColumn()
    verificacionReferenciaLaboral: VerificacionVeracidad;

}