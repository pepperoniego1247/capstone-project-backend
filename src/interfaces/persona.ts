export interface IPersona {
    dni: string,
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    fechaDeNacimiento: Date,
    edad: number,
    modoDeContacto: string,
    telefono?: string,
    whatsapp?: string
}

export interface IPersonaEmpleador {
    dni: string,
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    direccion: string,
    modoDeContacto: string,
    provinciaDomicilio: string,
    referenciaDomicilio: string,
    distritoDomicilio: string,
    departamentoDomicilio: string,
    telefono?: string,
    whatsapp?: string
}