import { IPersona } from "./persona";

export interface ICita {
    persona: IPersona,
    fechaDeCita: Date,
    eliminado: boolean,
    estado: string
}