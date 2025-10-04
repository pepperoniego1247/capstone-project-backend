import { ObjectLiteral } from "typeorm";

export interface ICreatedEntrevista {
    fechaEntrevista: Date,
    estado: string,
    empleador: ObjectLiteral,
    eliminado: boolean,
    trabajador: ObjectLiteral
    pedido: ObjectLiteral
}