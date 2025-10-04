import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Trabajador } from "./trabajador";
import { Empleador } from "./empleador";
import { Puesto } from "./puesto";
import { FuncionesConvenio } from "./funcionesConvenio";
import { Usuario } from "./usuario";
import { Pedido } from "./pedido";
import { Entrevista } from "./Entrevista";

@Entity()
export class Convenio extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => Empleador, (empleador) => empleador)
  empleador: Empleador;

  @ManyToOne(() => Trabajador, (trabajador) => trabajador)
  trabajador: Trabajador;

  @Column()
  fechaConvenio: Date;

  @Column()
  fechaInicio: Date;

  @Column()
  fechaFin: Date;

  @Column({ nullable: true })
  fechaFinal: Date;

  @Column()
  sueldo: string;

  @Column({ nullable: true })
  observacion: string

  @ManyToOne(() => Puesto, (puesto) => puesto)
  puesto: Puesto;

  @OneToMany(
    () => FuncionesConvenio,
    (funcionesConvenio) => funcionesConvenio.convenio
  )
  funcionesConvenio: FuncionesConvenio[];

  @Column({ nullable: true })
  funcionesOtros: string;

  @Column()
  estado: string;

  @Column({ nullable: true })
  motivoEstado: string;

  // @OneToOne(() => Pedido)
  // @JoinColumn()
  // pedido: Pedido;

  @Column()
  resultado: string;

  @Column({ nullable: true })
  motivoAnuladoResultado: string;

  @Column()
  estadoConvenio: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.convenio)
  usuario: Usuario;

  @OneToOne(() => Entrevista)
  @JoinColumn()
  entrevista: Entrevista;
}
