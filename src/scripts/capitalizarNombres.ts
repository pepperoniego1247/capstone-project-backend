export const capitalizarNombres = (dniResponse: any) => {
    const nombresLista: string[] = dniResponse['nombres'].split(" ");
    nombresLista.forEach((nombre: string, index: number) => nombresLista[index] = nombre[0] + nombre.slice(1, nombre.length).toLowerCase());

    return {
        nombres: nombresLista.join(" "),
        apellidoPaterno: `${dniResponse["apellidoPaterno"][0]}${dniResponse["apellidoPaterno"].slice(1, dniResponse["apellidoPaterno"].length).toLowerCase()}`,
        apellidoMaterno: `${dniResponse["apellidoMaterno"][0]}${dniResponse["apellidoMaterno"].slice(1, dniResponse["apellidoMaterno"].length).toLowerCase()}`,
    }   
}

