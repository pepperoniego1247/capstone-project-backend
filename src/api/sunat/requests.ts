export const requestNewDocumentSunat = async (body: any) => {
    const newDocumentBoleta = await fetch("https://back.apisunat.com/personas/v1/sendBill", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!newDocumentBoleta.ok) throw new Error("ERROR EN SUNAT");
    return newDocumentBoleta.json();
}

export const statusNewDocument = async (documentId: string) => {
    const response = await fetch(`https://back.apisunat.com/documents/${documentId}/getById`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!response.ok) throw new Error("ERROR EN ESTADO DE DOCUMENTO");
    return response.json();
}

export const consultarDNI = async (dni: string) => {
    try {
        const response = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${ dni }`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer apis-token-12544.vXzPZ5Kl6NLSkYzgyt0TSkozmgdXMKAV`,
            }
        });

        if (!response.ok) throw new Error("HTTP ERROR EN RENIEC");
        return response.json();

    } catch (error) {
        console.error("Error al consultar el DNI:", error);
        throw error;
    }
}

export const consultarUbigueo = async (url: string) => {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    } catch (error) {
        throw error;
    }
}

