import { ObjectLiteral } from "typeorm";

export interface IverificacionDomiciliaria{
    estadocivil: string;
    tenencia: string;
    residencia: string;//
    religion: string;
    direccion: string;//
    pisoDomicilio: string;
    paredesDomicilio: string;
    techosDomicilio: string;
    puertasDomicilio: string;
    serviciosBasicos: string;
    alumbradoPublico: string;
    internetTelefono: string;
    tipoVivienda: string;
    tipoConstruccion: string;
    materialPredominante: string;
    pisoHabitante: string;
    caracteristicasZona: string;
    trabajador: ObjectLiteral;
    usuario: ObjectLiteral;
}