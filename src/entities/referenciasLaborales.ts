import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ReferenciasLaborales extends BaseEntity{
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    cargoAnterior: string;

    @Column()
    funcionesDesempeñadas: string;

    @Column()
    tiempoTrabajo: string;

    @Column()
    fechaTrabajo: string;

    @Column()
    zonaTrabajo: string;
    
    @Column()
    sueldoGanaba: number;

    @Column()
    motivoSalida: string;

    @Column()
    observacionesSegundaLlamada: string;

    @Column()
    conclusiones: string;

    @Column()
    archivoResumen: string;

    @Column()
    archivoVerificacion: string;

    
}