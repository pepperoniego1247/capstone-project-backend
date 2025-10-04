import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InformeEntrevista } from "./informeEntrevista";
import { Trabajador } from "./trabajador";

@Entity()
export class RespuestasTestConocimientos extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    tipo_test: string;
    @Column()
    respuesta1: string;
    @Column()
    respuesta2: string;
    @Column()
    respuesta3: string;
    @Column()
    respuesta4: string;
    @Column()
    respuesta5: string;
    @Column()
    respuesta6: string;
    @Column()
    respuesta7: string;
    @Column()
    respuesta8: string;
    @Column()
    respuesta9: string;
    @Column()
    respuesta10: string;
    
    @Column({nullable:true})
    respuesta11: string;

    @ManyToOne(() => Trabajador, trabajador => trabajador)
    trabajador: Trabajador;
}