import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { TestBaron } from "./testBaron";
import { Usuario } from "./usuario";
import { SeleccionNannys } from "./seleccionNannys";
import { Trabajador } from "./trabajador";
import { RespuestasTestConocimientos } from "./respuestasTestConocimientos";
import { PuntajeEntrevista } from "./puntajeEntrevista";

@Entity()
export class InformeEntrevista extends BaseEntity{
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    fecha: Date;

    @Column()
    calificacion: string;

    @Column()
    puntajeFinal: number;

    @Column()
    observacionesFinales: string;

    // @OneToOne(() => TestBaron)
    // @JoinColumn()
    // testBaron: TestBaron;

    @OneToOne(() => PuntajeEntrevista)
    @JoinColumn()
    puntajeEntrevista: PuntajeEntrevista;

    @OneToOne(() => SeleccionNannys)
    @JoinColumn()
    seleccionNannys: SeleccionNannys;


    @ManyToOne(() => Usuario, Usuario => Usuario.informeEntrevista)
    usuario: Usuario;

    @ManyToOne(() => Trabajador, Trabajador => Trabajador)
    trabajador: Trabajador;

    @Column({nullable:true})
    eliminado: boolean;
}