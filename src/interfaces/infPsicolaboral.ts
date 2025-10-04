import { ObjectLiteral } from "typeorm";

export interface IinfPsicolaboral{
    fechaInforme:Date;
    examenesAplicados:string;
    conclusiones:string;
    recomendaciones:string;
    estado:string;
    evaluacionProyectiva:string;
    eliminado:boolean;
    trabajador: ObjectLiteral;
    usuario: ObjectLiteral;
}