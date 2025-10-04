import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InformeEntrevista } from "./informeEntrevista";

@Entity()
export class TestBaron extends BaseEntity{
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column()
    respuestaBaron1: number;
    @Column()
    respuestaBaron2: number;
    @Column()
    respuestaBaron3: number;
    @Column()
    respuestaBaron4: number;
    @Column()
    respuestaBaron5: number;
    @Column()
    respuestaBaron6: number;
    @Column()
    respuestaBaron7: number;
    @Column()
    respuestaBaron8: number;
    @Column()
    respuestaBaron9: number;
    @Column()
    respuestaBaron10: number;
    @Column()
    respuestaBaron11: number;
    @Column()
    respuestaBaron12: number;
    @Column()
    respuestaBaron13: number;
    @Column()
    respuestaBaron14: number;
    @Column()
    respuestaBaron15: number;
    @Column()
    respuestaBaron16: number;
    @Column()
    respuestaBaron17: number;
    @Column()
    respuestaBaron18: number;
    @Column()
    respuestaBaron19: number;
    @Column()
    respuestaBaron20: number;
    @Column()
    respuestaBaron21: number;
}