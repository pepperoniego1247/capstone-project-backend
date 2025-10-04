import { ObjectLiteral } from "typeorm";

export interface IinfEntrevista{
    fecha:Date;
    calificacion:string;
    puntajeFinal:number;
    observacionesFinales:string;
    eliminado:boolean;
    trabajador: ObjectLiteral;
    usuario: ObjectLiteral;
}