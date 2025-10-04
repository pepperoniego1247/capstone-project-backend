import { ObjectLiteral } from "typeorm";

export interface IConvenio {
  dni: string;
  trabajador: ObjectLiteral;
  empleador: ObjectLiteral;
  fechaRegistro: Date;
  fechaInicio: Date;
  fechaFin: Date;
  sueldo: string;
  puesto: ObjectLiteral;
  estado: string;
  resultado: string;
  estadoConvenio: string;
}
