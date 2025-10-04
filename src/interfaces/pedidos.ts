export interface IHorario {
    lunes: string,
    martes: string,
    miercoles: string,
    jueves: string,
    viernes: string,
    sabado: string,
    domingo: string
}

export interface IUPedido extends Omit<IPedido, "empleador"> {}

export interface IPedido {
    edadMinima: number,
    edadMaxima: number,
    funciones: string,
    rutina: string,
    observaciones: string,
    estado: string,
    movilidad: string,
    horasSemanales: number,
    sueldo: number,
    cantAdultos: number,
    cantNiños: number,
    mascotas: boolean,
    ordenDeServicio: boolean,
    cantPisos: number,
    modalidad: any,
    horarioPedido: any,
    puesto: any,
    empleador: any
}