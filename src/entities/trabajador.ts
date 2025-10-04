import { BaseEntity, OneToMany, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Persona } from "./persona";
import { Cita } from "./cita";
import { Convenio } from "./convenio";
import { Entrevista } from "./Entrevista";
import { Pedido } from "./pedido";
import { DatosVivienda } from "./datosVivienda";
import { SituacionFamiliar } from "./situacionFamiliar";
import { CheckList } from "./checkList";
import { PuestoTrabajador } from "./puestoTrabajador";
import { ModalidadTrabajador } from "./modalidadTrabajador";
import { Folder } from "./folder";
import { UbicacionArchivo } from "./ubicacionArchivos";
import { SeleccionNannys } from "./seleccionNannys";
import { VerificacionVeracidad } from "./verificacionVeracidad";
import { HerenciaVeracidadReferencia } from "./herenciaVeracidadReferencia";
import { InformePsicolaboral } from "./informePsicolaboral";
import { InformeEntrevista } from "./informeEntrevista";
import { Usuario } from "./usuario";
import { RespuestasTestConocimientos } from "./respuestasTestConocimientos";

@Entity()
export class Trabajador extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column({ nullable: true })
    codigoTrabajador: string

    @Column({ nullable: true })
    gradoInstruccion: string

    @Column({ nullable: true })
    motivoNoAC: string

    @Column({ nullable: true })
    nivelEstudios: string

    // @Column({ nullable: true })
    // puestoPostula: string

    // @Column({ nullable: true })
    // modalidadPostula: string

    @Column({ nullable: true })
    evaluacionPsicologica: string

    @Column({ nullable: true })
    horaIngreso: Date
    
    @Column({ nullable: true })
    horaSalida: Date

    @Column({ nullable: true })
    fechaInscripcion: Date

    @Column({ nullable: true })
    observacion: string;

    @Column({ nullable: true })
    pretencionSalarial: string

    @Column({ nullable: true })
    departamentoNacimiento: string
   
    @Column({ nullable: true, default: "NO ESPECIFICADO" })
    mensaje: string

    @Column({ nullable: true })
    provinciaNacimiento: string
    
    @Column({ nullable: true })
    distritoNacimiento: string

    @Column({ nullable: true })
    fechaNacimiento: Date

    @Column({ nullable: true })
    genero: string

    @Column({ nullable: true })
    estadoCivil: string

    @Column({ nullable: true })
    religion: string

    @Column({ nullable: true })
    tenencia: string

    @Column({ nullable: true })
    edad: string

    @Column({ nullable: true })
    fotoTrabajador: string

    @Column({ nullable: true })
    reciboAgua: string

    @Column({ nullable: true })
    reciboLuz: string

    @Column({ nullable: true })
    linkDrive: string
    
    @Column({ nullable: true })
    colocado: boolean

    @Column()
    eliminado: boolean;

    @OneToOne(() => Cita)
    @JoinColumn()
    cita: Cita;

    @OneToMany(() => Convenio, (convenio) => convenio.trabajador)
    convenios: Convenio[];

    @OneToMany(() => RespuestasTestConocimientos, (respuestasTestConocimientos) => respuestasTestConocimientos.trabajador)
    respuestasTestConocimientos: RespuestasTestConocimientos[];

    @OneToMany(() => Entrevista, (entrevista) => entrevista.trabajador)
    entrevistas: Entrevista[];

    @OneToMany(() => Pedido, (Pedido) => Pedido.trabajador)
    Pedidos: Pedido[];

    @OneToMany(() => SituacionFamiliar, (situacionFamiliar) => situacionFamiliar.trabajador)
    situacionFamiliars: SituacionFamiliar[];

    @OneToMany(() => PuestoTrabajador, (PuestoTrabajador) => PuestoTrabajador.trabajador)
    puestoTrabajador: PuestoTrabajador[];

    @OneToMany(() => InformePsicolaboral, (InformePsicolaboral) => InformePsicolaboral.trabajador)
    informePsicolaboral: InformePsicolaboral[];
 
    @OneToMany(() => ModalidadTrabajador, (ModalidadTrabajador) => ModalidadTrabajador.trabajador)
    modalidadTrabajador: ModalidadTrabajador[];

    @OneToMany(() => InformeEntrevista, (InformeEntrevista) => InformeEntrevista.trabajador)
    informeEntrevista: InformeEntrevista[];

    @ManyToOne(() => SeleccionNannys, SeleccionNannys => SeleccionNannys)
    seleccionNannys: SeleccionNannys;

    @OneToOne(() => DatosVivienda)
    @JoinColumn()
    datosVivienda: DatosVivienda;

    @OneToOne(() => CheckList)
    @JoinColumn()
    CheckList: CheckList;

    //TODO CAMBIAR EL NOMBRE DE ESTA TABLA DPS A UNA MAS ADECUADA
    @OneToOne(() => HerenciaVeracidadReferencia)
    @JoinColumn()
    herenciaVeracidadReferencia: HerenciaVeracidadReferencia;

    @OneToOne(() => VerificacionVeracidad)
    @JoinColumn()
    verificacionVeracidad: VerificacionVeracidad;

    @ManyToOne(() => Folder, (Folder) => Folder)
    folder: Folder;

    @ManyToOne(() => UbicacionArchivo, (ubicacionArchivo) => ubicacionArchivo)
    ubicacionArchivo: UbicacionArchivo;

    @OneToMany(() => VerificacionVeracidad, (verificacionVeracidad) => verificacionVeracidad.trabajador)
    verificacionReferenciaLaboral: VerificacionVeracidad[];

    @ManyToOne(() => Usuario, (usuario) => usuario.pedido)
    usuario: Usuario;
}