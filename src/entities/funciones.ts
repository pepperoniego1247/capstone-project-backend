import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FuncionesConvenio } from "./funcionesConvenio";
import { FuncionesPedido } from "./funcionesPedido";

@Entity()
export class Funciones extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToMany(
    () => FuncionesConvenio,
    (funcionesConvenio) => funcionesConvenio.funcion
  )
  funcionesConvenio: FuncionesConvenio[];

  @OneToMany(() => FuncionesPedido, (FuncionesPedido) => FuncionesPedido.funcion)
  funcionesPedido: FuncionesPedido[];
  
  @Column()
  descripcion: string;

  @Column({ nullable: true })
  eliminado: boolean;
}
