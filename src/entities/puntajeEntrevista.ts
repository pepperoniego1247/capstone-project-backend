import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InformeEntrevista } from "./informeEntrevista";
@Entity()
export class PuntajeEntrevista extends BaseEntity{
    @PrimaryGeneratedColumn("increment")
    id:number;
    @Column()
    respuesta1: number;
    @Column()
    respuesta2: number;
    @Column()
    respuesta3: number;
    @Column()
    respuesta4: number;
    @Column()
    respuesta5: number;
    @Column()
    respuesta6: number;
    @Column()
    respuesta7: number;
    @Column()
    respuesta8: number;
    @Column()
    respuesta9: number;
    @Column()
    respuesta10: number;
    
    @OneToOne(()=> InformeEntrevista)
    @JoinColumn()
    informeEntrevista: InformeEntrevista;
}