import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { FotoDomicilio } from "./fotoDomicilio";
import { DescripcionDomicilio } from "./descripcionDomicilio";
import { Trabajador } from "./trabajador";
import { SeleccionNannys } from "./seleccionNannys";
import { Usuario } from "./usuario";

@Entity()
export class DatosVivienda extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tiempoResidencia: string;

    @Column()
    tipoVivienda: string;

    @Column()
    tipoConstruccion: string;

    @Column()
    materialPredominante: string;

    @Column()
    pisoHabitante: string;

    @Column()
    caracteristicaZona: string;
    
    @OneToOne(() => FotoDomicilio)
    @JoinColumn()
    fotoDomicilio: FotoDomicilio;

    @OneToOne(() => DescripcionDomicilio)
    @JoinColumn()
    descripcionDomicilio: DescripcionDomicilio;

    @OneToOne(() => Trabajador)
    @JoinColumn()
    trabajador: Trabajador;

    @ManyToOne(() => Usuario, Usuario => Usuario)
    usuario: Usuario;

    @ManyToOne(() => SeleccionNannys, SeleccionNannys => SeleccionNannys)
    seleccionNannys: SeleccionNannys;
}