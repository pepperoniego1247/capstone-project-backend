import { Request, Response, Router } from "express";
import { appDataSource } from "../dataBase";
import { validationToken } from "../middlewares/token";
import { checkSchema, param } from "express-validator";
import { validateReq } from "../middlewares/validateRequest";
import { IPersona } from "../interfaces/persona";
import { consultarDNI } from "../api/sunat/requests";
import { capitalizarNombres } from "../scripts/capitalizarNombres";

const router = Router();

router.get("/persona_dni/get_all/",
    async (_: Request, res: Response) => {
        try {
            const personList = await appDataSource.getRepository("persona").find();
            const personListEmpleadores = await appDataSource.getRepository("empleador").find({ relations: ["persona"] });

            const data = personList.filter((person: any) => !personListEmpleadores.some((empleador: any) => person.id === empleador.persona.id));
            const dataDni: string[] = [];

            data.forEach((persona) => dataDni.push(persona.dni));

            return res.send(dataDni);
        } catch (error) {
            // console.log(error);
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.post("/persona_data/get_all/:dni",
    param("dni")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .isLength({ min: 8, max: 8 })
        .withMessage("El campo dni no cumple con los parametros, debe ser numerico y de una longitud de 8 digitos maximo y minimo."),
    validateReq,
    checkSchema({
        type: {
            in: ["body"],
            optional: true,
            isString: true
        }
    }),
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const personExists = await appDataSource.getRepository("persona").findOne({ where: { dni: req.params["dni"] } });
            if (personExists) {
                const { nombres, apellidoMaterno, apellidoPaterno } = personExists;
                if (req.body.type === "empleador") return res.send({ nombresEmpleador: nombres, apellidoPaternoEmpleador: apellidoPaterno, apellidoMaternoEmpleador: apellidoMaterno });
                if (req.body.type === "trabajador") return res.send({ nombresTrabajador: nombres, apellidoPaternoTrabajador: apellidoPaterno, apellidoMaternoTrabajador: apellidoMaterno });
                if (req.body.type === "familiar") return res.send({
                    nombreFamiliar: nombres,
                    apellidoPaternoFamiliar: apellidoPaterno,
                    apellidoMaternoFamiliar: apellidoMaterno
                });
                return res.send({ nombres: personExists["nombres"], apellidoPaterno: personExists["apellidoPaterno"], apellidoMaterno: personExists["apellidoMaterno"] });
            }

            if (req.params.dni.length !== 8) return res.status(403).send({ message: "El dni debe tener 8 digitos" });

            const response = await consultarDNI(req.params["dni"]);

            if (req.body.type === "familiar") return res.send({
                nombreFamiliar: capitalizarNombres(response).nombres,
                apellidoPaternoFamiliar: capitalizarNombres(response).apellidoPaterno,
                apellidoMaternoFamiliar: capitalizarNombres(response).apellidoMaterno
            });
            return res.send(capitalizarNombres(response));
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);


export default router;