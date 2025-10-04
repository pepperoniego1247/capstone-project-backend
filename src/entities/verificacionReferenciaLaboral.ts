import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Trabajador } from "./trabajador";
import { SeleccionNannys } from "./seleccionNannys";

@Entity()
export class VerificacionReferenciaLaboral extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    nombreEmpleador: string;
    
    @Column()
    numeroContacto: string;
    
    @Column()
    cargoDesempenado: string;
    
    @Column()
    funcionesDesempenadas: string;
    
    @Column()
    honradaConfiable: boolean;
    
    @Column()
    relacionFamiliares: string;
    
    @Column()
    tiempoTrabajo: string;
    
    @Column()
    fechaTrabajo: string; // En este caso, podría ser un rango de fechas en formato string.
    
    @Column()
    desempenoGeneral: number; // Calificación del 1 al 10.
    
    @Column()
    calificacionCocina: number; // Calificación del 1 al 10.
    
    @Column()
    calificacionLimpieza: number; // Calificación del 1 al 10.
    
    @Column()
    aspectosPorMejorar: string;
    
    @Column()
    motivoCeseFunciones: string;
    
    @Column()
    recomendariaContratacion: boolean;
    
    @Column()
    zonaTrabajo: string;
    
    @Column()
    sueldoGanado: number;
    
    @Column()
    puedeDarReferencia: boolean;

    @OneToOne(() => Trabajador)
    @JoinColumn()
    trabajador: Trabajador;

    @OneToOne(() => SeleccionNannys, (seleccionNannys) => seleccionNannys.verificacionReferenciaLaboral)
    seleccionNannys: SeleccionNannys;
}