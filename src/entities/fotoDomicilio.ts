import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DatosVivienda } from "./datosVivienda";

@Entity()
export class FotoDomicilio extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id_fotografia: number;

    @Column()
    foto_persona_atendio: string;

    @Column()
    foto_nomb_calle: string;

    @Column()
    foto_vista_frontal: string;

    @Column()
    foto_cuadra: string;

    @OneToOne(() => DatosVivienda)
    @JoinColumn()
    DatosVivienda: DatosVivienda;
}