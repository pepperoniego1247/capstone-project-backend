export function agruparDiasPorHoras(days: { [key: string]: string }): string {
    const ordenDias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const abreviaturas: { [key: string]: string } = {
        lunes: "L",
        martes: "M",
        miercoles: "X",
        jueves: "J",
        viernes: "V",
        sabado: "S",
        domingo: "D",
    };

    const formatoHoras = (date: string): string => {
        return new Date(date).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "America/Lima",
        });
    };

    const grupos: { [key: string]: string[] } = {};

    for (const dia of ordenDias) {
        if (days[dia]) {
            const [inicio, fin] = days[dia].split(",");
            if (inicio === fin) continue;

            const clave = `${formatoHoras(inicio)} a ${formatoHoras(fin)}`;
            if (!grupos[clave]) {
                grupos[clave] = [];
            }
            grupos[clave].push(dia);
        }
    }

    const compactarDias = (dias: string[]): string => {
        const indices = dias.map((dia) => ordenDias.indexOf(dia));
        indices.sort((a, b) => a - b);

        const rangos: string[] = [];
        let inicio = indices[0];

        for (let i = 1; i <= indices.length; i++) {
            if (i === indices.length || indices[i] !== indices[i - 1] + 1) {
                const fin = indices[i - 1];
                if (inicio === fin) {
                    rangos.push(abreviaturas[ordenDias[inicio]]);
                } else {
                    rangos.push(`${abreviaturas[ordenDias[inicio]]}-${abreviaturas[ordenDias[fin]]}`);
                }
                if (i < indices.length) inicio = indices[i];
            }
        }

        return rangos.join(", ");
    };

    const resultado: string[] = [];
    for (const [horas, diasAgrupados] of Object.entries(grupos)) {
        const diasCompactados = compactarDias(diasAgrupados);
        resultado.push(`${diasCompactados}: ${horas}`);
    }

    return resultado.join(", ");
}
