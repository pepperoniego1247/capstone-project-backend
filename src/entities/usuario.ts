import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Persona } from "./persona";
import { InformePsicolaboral } from "./informePsicolaboral";
import { InformeEntrevista } from "./informeEntrevista";
import { DatosVivienda } from "./datosVivienda";
import { Cita } from "./cita";
import { Pedido } from "./pedido";
import { Entrevista } from "./Entrevista";
import { Trabajador } from "./trabajador";
import { Empleador } from "./empleador";
import { Convenio } from "./convenio";
import { HistorialUsuario } from "./historialUsuario";
import { truncate } from "fs";

@Entity()
export class Usuario extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ length: 10 })
    userName: string;

    @Column({ length: 60 })
    password: string;

    @Column({ nullable: true })
    names: string;

    @Column()
    type: string;

    @Column({ nullable: true })
    eliminado: boolean;

    @OneToMany(() => InformePsicolaboral, (InformePsicolaboral) => InformePsicolaboral.usuario)
    informePsicolaboral: InformePsicolaboral[]
    
    @OneToMany(() => InformeEntrevista, (InformeEntrevista) => InformeEntrevista.usuario)
    informeEntrevista: InformeEntrevista[]
    
    @OneToMany(() => DatosVivienda, (DatosVivienda) => DatosVivienda.usuario)
    datosVivienda: DatosVivienda[]

    @OneToMany(() => Cita,(Cita) => Cita.usuario)
    cita: Cita[]

    @OneToMany(() => Pedido,(Pedido) => Pedido.usuario)
    pedido: Pedido[]
    
    @OneToMany(() => Empleador,(Empleador) => Empleador.usuario)
    empleador: Empleador[]

    @OneToMany(() => Convenio,(Convenio) => Convenio.usuario)
    convenio: Convenio[]

    @OneToMany(() => Entrevista,(Entrevista) => Entrevista.usuario)
    entrevista: Entrevista[]

    @OneToMany(() => Trabajador,(Trabajador) => Trabajador.usuario)
    trabajador: Trabajador[]

    @OneToMany(() => HistorialUsuario,(HistorialUsuario) => HistorialUsuario.usuario)
    historialUsuario: HistorialUsuario[]
}