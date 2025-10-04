import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./usuario";


@Entity()
export class HistorialUsuario extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  seccion: string;

  @Column()
  modulo: string;

  @Column()
  descripcion: string;

  @Column()
  accion: string;

  @Column()
  fecha: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.historialUsuario)
  usuario: Usuario;
}
