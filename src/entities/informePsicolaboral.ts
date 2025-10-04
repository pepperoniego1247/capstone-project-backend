import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SeleccionNannys } from "./seleccionNannys";
import { Usuario } from "./usuario";
import { Trabajador } from "./trabajador";
import { TestBaron } from "./testBaron";
@Entity()
export class InformePsicolaboral extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    fechaInforme: Date;

    // @Column()
    // puesto: string;

    @Column()
    examenesAplicados: string;

    @Column()
    conclusiones: string;

    @Column()
    recomendaciones: string;

    @Column()
    estado: string;
    
    @OneToOne(() => TestBaron)
    @JoinColumn()
    testBaron: TestBaron;

    @Column({nullable:true})
    evaluacionProyectiva: string;

    @ManyToOne(() => SeleccionNannys, SeleccionNannys => SeleccionNannys)
    seleccionNannys: SeleccionNannys;

    @ManyToOne(() => Trabajador, Trabajador => Trabajador)
    trabajador: Trabajador;
    
    @ManyToOne(() => Usuario, Usuario => Usuario.informePsicolaboral)
    usuario: Usuario;

    @Column({nullable:true})
    eliminado: boolean;
}