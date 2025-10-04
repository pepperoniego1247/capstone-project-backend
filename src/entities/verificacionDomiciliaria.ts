// import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
// import { Trabajador } from "./trabajador";
// import { Usuario } from "./usuario";

// @Entity()
// export class VerifDomicPage extends BaseEntity {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @OneToOne(() => Trabajador)
//   @JoinColumn()
//   trabajador: Trabajador;

//   @Column()
//   edad: number;

//   @Column()
//   estadoCivil: string;

//   @Column()
//   tenencia: string;

//   @Column()
//   tiempoResidencia: string;

//   @Column()
//   religion: string;

//   @Column()
//   direccionActual: string;

//   @Column("simple-array")
//   pisoDomicilio: string[];

//   @Column("simple-array")
//   paredesDomicilio: string[];

//   @Column("simple-array")
//   techosDomicilio: string[];

//   @Column("simple-array")
//   puertasDomicilio: string[];

//   @Column("simple-array")
//   serviciosBasicos: string[];

//   @Column()
//   alumbradoPublico: boolean;

//   @Column()
//   internetTelefono: boolean;

//   @Column()
//   tipoVivienda: string;

//   @Column()
//   tipoConstruccion: string;

//   @Column()
//   materialPredominante: string;

//   @Column()
//   pisoHabitante: string;

//   @Column()
//   caracteristicasZona: string;

//   @Column()
//   fotoReceiver: string;

//   @Column()
//   fotoHouseNumber: string;

//   @Column()
//   fotoFrontView: string;

//   @Column()
//   fotoStreetView: string;

//   @ManyToOne(() => Usuario, Usuario => Usuario)
//     usuario: Usuario;

// }