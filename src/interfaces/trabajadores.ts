export interface IUPersonaTrabajador {
    departamentoDomicilio: string,
    provinciaDomicilio: string,
    distritoDomicilio: string,
    referenciaDeDomicilio: string,
    direccion: string
}

export interface ITrabajador {
    codigoTrabajador: string,
    fechaInscripcion: Date,
    evaluacionPsicologica: string,
    fechaNacimiento: Date,
    edad: number,
    motivoNoAC: string,
    horaSalida: Date,
    horaEntrada: Date,
    departamentoNacimiento: string,
    provinciaNacimiento: string,
    distritoNacimiento: string,
    ubicacionArchivo: string,
    folder: string,
    gradoInstruccion: string,
    nivelEstudios: string,
    puesto: string,
    modalidad: string,
    pretencionSalarial: number,
    eliminado: boolean
}