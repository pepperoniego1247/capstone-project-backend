import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DatosVivienda } from "./datosVivienda";

@Entity()
export class DescripcionDomicilio extends BaseEntity{
    @PrimaryGeneratedColumn("increment")
    id:number

    @Column()
    piso : string;

    @Column()
    paredes : string;

    @Column()
    techo : string;

    @Column()
    puertas : string;

    @Column()
    serviciosBasicos : string;

    @Column()
    alumbradoPublico : string;

    @Column()
    internetTelefono : string;

    @OneToOne(() => DatosVivienda)
    @JoinColumn()
    datosVivienda: DatosVivienda;
}