import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, Unique, OneToMany } from "typeorm";
import { Cita } from "./cita";

@Unique(["dni"])
@Entity()
export class Persona extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    dni: string;

    @Column()
    nombres: string;
    
    @Column()
    apellidoPaterno: string;
    
    @Column()
    apellidoMaterno: string;
    
    @Column({ nullable: true })
    whatsapp: string;

    @Column({ nullable: true })
    telefono: string;

    @Column({ nullable: true })
    referenciaDeDomicilio: string;

    @Column({ nullable: true })
    provinciaDomicilio: string;

    @Column({ nullable: true })
    departamentoDomicilio: string;

    @Column({ nullable: true })
    distritoDomicilio: string;

    @Column({ nullable: true })
    direccion: string;

    @Column({ nullable: true })
    modoDeContacto: string;

    @OneToMany(() => Cita, (cita) => cita.persona)
    citas: Cita[];
}