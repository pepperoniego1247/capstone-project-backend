import { BaseEntity,Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Trabajador } from "./trabajador";
import { SeleccionNannys } from "./seleccionNannys";

@Entity()
export class CheckList extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    //! CAMPOS POR AGREGAR
    @Column({ default: false })
    curriculum: boolean;

    @Column({ default: false })
    declaracion_jurada_salud: boolean;

    @Column({ default: false })
    ficha_datos_familiares: boolean;

    @Column({ default: false })
    resumen_ex_empleadores: boolean;

    @Column({ default: false })
    lista_platos: boolean;

    @Column({ default: false })
    listado_urbanizaciones: boolean;

    @Column({ default: false })
    declaracion_jurada_validacion: boolean;

    @Column({ default: false })
    copia_dni: boolean;

    @Column({ default: false })
    recibo_luz_agua: boolean;

    @Column({ default: false })
    cartas_recomendacion: boolean;

    @Column({ default: false })
    evaluaciones_psicologicas: boolean;

    @Column({ default: false })
    constancia_estudios: boolean;

    @Column({ default: false })
    certiadulto_certijoven: boolean;

    @Column({ default: false })
    comportamiento_redes_sociales: boolean;

    @Column({ default: false })
    foto: boolean;

    @Column({ default: false })
    informe_psicologico: boolean;

    @Column({ default: false })
    visita_verificacion_domiciliaria: boolean;

    @OneToOne(() => Trabajador)
    @JoinColumn()
    trabajador: Trabajador;

    @ManyToOne(() => SeleccionNannys, SeleccionNannys => SeleccionNannys)
    seleccionNannys: SeleccionNannys;
}