import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Funciones } from "./funciones";
import { Convenio } from "./convenio";

@Entity()
export class FuncionesConvenio extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Funciones, (funciones) => funciones)
  funcion: Funciones;

  @ManyToOne(() => Convenio, (convenio) => convenio)
  @JoinColumn({ name: "convenio_id" }) // Especificar el nombre de la columna clave foránea
  convenio: Convenio;
}
