import { ObjectLiteral } from "typeorm";

export interface checkList{
    curriculum: boolean;
    declaracion_jurada_salud: boolean;
    ficha_datos_familiares: boolean;
    resumen_ex_empleadores: boolean;
    lista_platos: boolean;
    listado_urbanizaciones: boolean;
    declaracion_jurada_validacion: boolean;
    copia_dni: boolean;
    recibo_luz_agua: boolean;
    cartas_recomendacion: boolean;
    evaluaciones_psicologicas: boolean;
    constancia_estudios: boolean;
    certiadulto_certijoven: boolean;
    comportamiento_redes_sociales: boolean;
    foto: boolean;
    informe_psicologico: boolean;
    visita_verificacion_domiciliaria: boolean;
    trabajador: ObjectLiteral;
}