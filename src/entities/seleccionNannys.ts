import { BaseEntity, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InformeEntrevista } from "./informeEntrevista";

import { DatosVivienda } from "./datosVivienda";
import { InformePsicolaboral } from "./informePsicolaboral";
import { CheckList } from "./checkList";
import { Trabajador } from "./trabajador";
import { VerificacionReferenciaLaboral } from "./verificacionReferenciaLaboral";


@Entity()
export class SeleccionNannys extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @OneToMany(() => DatosVivienda, (DatosVivienda) => DatosVivienda.seleccionNannys)
    datosVivienda: DatosVivienda[];

    @OneToMany(() => Trabajador, (Trabajador) => Trabajador.seleccionNannys)
    trabajador: Trabajador[];

    @OneToMany(() => VerificacionReferenciaLaboral, (VerificacionReferenciaLaboral) => VerificacionReferenciaLaboral.seleccionNannys)
    verificacionReferenciaLaboral: VerificacionReferenciaLaboral[];


    @OneToMany(() => InformePsicolaboral, (InformePsicolaboral) => InformePsicolaboral.seleccionNannys)
    informePsicolaboral: InformePsicolaboral[];

    @OneToMany(() => CheckList, (CheckList) => CheckList.seleccionNannys)
    checkList: CheckList[];


    @OneToOne(() => InformeEntrevista)
    @JoinColumn()
    informeEntrevista: InformeEntrevista;
}