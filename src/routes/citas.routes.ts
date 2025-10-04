import { Router, Response, Request } from "express";
import { validationToken } from "../middlewares/token";
import { appDataSource } from "../dataBase";
import { checkSchema, param } from "express-validator";
import { max, set } from "date-fns";
import { consultarDNI } from "../api/sunat/requests";
import { capitalizarNombres } from "../scripts/capitalizarNombres";
import { validateReq } from "../middlewares/validateRequest";
import { IPersona } from "../interfaces/persona";
import { ICita } from "../interfaces/citas";

const router = Router();

router.post("/citas/register/:id",
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id"),
    checkSchema({
        dni: {
            in: ["body"],
            isNumeric: true,
            isLength: {
                options: { max: 8, min: 8 },
                errorMessage: "El dni debe ser de 8 digitos."
            },
            notEmpty: true,
            errorMessage: "Los datos de dni son incorrectos."
        },
        nombres: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "El campo nombres no puede estar vacio!"
        },
        observacion: {
            in: ["body"],
            optional: true,
            isString: true,
            errorMessage: "Ocurrio un error en el campo de observaciones!"
        },
        apellidoPaterno: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "El campo apellido paterno no puede estar vacio!"
        },
        apellidoMaterno: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "El campo apellido materno no puede estar vacio!"
        },
        fechaCita: {
            in: ["body"],
            isISO8601: true,
            toDate: true,
            notEmpty: true,
            errorMessage: "Los datos de la fecha de cita son invalidos!"
        },
        modoDeContacto: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Los datos del metodo de contacto tuvieron un error!"
        },
        telefono: {
            in: ["body"],
            isMobilePhone: true,
            optional: true,
            errorMessage: "Datos invalidos para el numero de telefono!."
        },
        whatsapp: {
            in: ["body"],
            isMobilePhone: true,
            optional: true,
            errorMessage: "Datos invalidos para el numero de telefono!."
        },
        estado: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en los datos del estado!."
        }
    }),
    // validationToken,,
    validateReq,
    async (req: Request, res: Response) => {
        try {
            let personaTemp = await appDataSource.getRepository("persona").findOne({ where: { dni: req.body["dni"] } });

            if (req.body.dni.length !== 8) return res.status(403).send({ message: "El dni debe tener 8 digitos" });

            if (!personaTemp) {
                // const dniResponse = await consultarDNI(req.body["dni"]);
                // if (!dniResponse) return res.status(404).send({ message: "La persona no se encontro en reniec!" });
                const { nombres, apellidoMaterno, apellidoPaterno } = req.body;
                delete req.body["nombres"];
                delete req.body["apellidoMaterno"];
                delete req.body["apellidoPaterno"];

                const dniResponse = {
                    nombres,
                    apellidoMaterno,
                    apellidoPaterno
                }

                const { ...newPersona } = { ...capitalizarNombres(dniResponse), ...req.body };
                const newPersonaSave: IPersona = <IPersona>(<unknown>{ ...newPersona });
                personaTemp = await appDataSource.getRepository("persona").save(newPersonaSave);
            }

            const usuario = await appDataSource.getRepository("usuario").findOne({ where: { id: req.params.id} });
            if (!usuario) return res.status(403).send({ message: "Ocurrio un error con el usuario!" });

            const { fechaCita, estado, observacion } = req.body;
            console.log(observacion);
            const { ...cita } = { fechaCita: fechaCita, observacion, estado: estado, persona: personaTemp, eliminado: false };
            const newCita: ICita = <ICita>(<unknown>{ ...cita });
            await appDataSource.getRepository("cita").save({ ...newCita, usuario });
            await appDataSource.getRepository("historial_usuario").save({ usuario: req.params.id, seccion: "RECLUTAMIENTO", modulo: "CITAS", descripcion: `REGISTRO UNA NUEVA CITA CON EL DNI: ${req.body.dni}`, accion: "REGISTRAR", fecha: new Date() });
            return res.send({
                message: "Se ha registrado correctamente!"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "error en el servidor" });
        }
    }
);

router.get("/citas/get_quantity/",
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const counter = await appDataSource.getRepository("cita").count({ where: { eliminado: false } });

            return res.send({ counter });
        } catch (error) {
            return res.status(500).send({ message: "error en el servidor!" });
        }
    }
);

router.get("/citas/get_all/",
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const data = await appDataSource.getRepository("cita").find({
                where: { eliminado: false }, relations: ["persona"], select: {
                    id: true, fechaCita: true, estado: true, observacion: true, persona: {
                        id: true, dni: true, nombres: true, apellidoPaterno: true, apellidoMaterno: true, whatsapp: true, telefono: true, modoDeContacto: true
                    }
                }
            });
            return res.send(data);
        } catch (error) {
            return res.status(500).send({ message: "error en el servidor!" });
        }
    }
);

router.put("/citas/edit_by_id/:id/:idUser",
    param("id")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .withMessage("hubo un error en el parametro id!"),
    param("idUser")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el idUser"),
    checkSchema({
        dni: {
            in: ["body"],
            isNumeric: true,
            isLength: {
                options: { max: 8, min: 8 },
                errorMessage: "El dni debe ser de 8 digitos."
            },
            notEmpty: true,
            errorMessage: "Los datos de dni son incorrectos."
        }, 
        nombres: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "El campo nombres no puede estar vacio!"
        },
        apellidoPaterno: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "El campo apellido paterno no puede estar vacio!"
        },
        apellidoMaterno: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "El campo apellido materno no puede estar vacio!"
        },
        fechaCita: {
            in: ["body"],
            isISO8601: true,
            toDate: true,
            notEmpty: true,
            errorMessage: "Los datos de la fecha de cita son invalidos!"
        },
        modoDeContacto: {
            in: ["body"],
            isString: true,
            optional: true,
            errorMessage: "Los datos del metodo de contacto tuvieron un error!"
        },
        telefono: {
            in: ["body"],
            isString: true,
            optional: true,
            errorMessage: "Datos invalidos para el numero de telefono!."
        },
        whatsapp: {
            in: ["body"],
            isMobilePhone: true,
            optional: true,
            errorMessage: "Datos invalidos para el numero de telefono!."
        },
        estado: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en los datos del estado!."
        },
        observacion: {
            in: ["body"],
            optional: true,
            // isString: true,
            errorMessage: "Ocurrio un error en el campo de observaciones!"
        },
    }),
    validateReq,
    async (req: Request, res: Response) => {
        try {
            //* VALIDACIONES, RECUERDA TENER QUE AGREGAR LOS V-Headers
            const cita = await appDataSource.getRepository("cita").findOne({ where: { id: req.params["id"] }, relations: ["persona"] });
            if (!cita) return res.status(404).send({ message: "La cita no existe o no se encuentra en la base de datos!" });

            const { fechaCita, estado, observacion } = req.body;

            delete req.body["fechaCita"];
            delete req.body["observacion"];
            delete req.body["estado"];

            let dataPersonaNombres;

            if (req.body.dni.length !== 8) return res.status(403).send({ message: "El dni debe tener 8 digitos" });

            if (cita.persona.dni !== req.body["dni"]) {
                const dniResponse = await consultarDNI(req.body["dni"]);
                dataPersonaNombres = { ...capitalizarNombres(dniResponse) };
            }

            await appDataSource.getRepository("persona").update({ id: cita.persona.id }, { ...dataPersonaNombres, ...req.body });
            await appDataSource.getRepository("cita").update({ id: cita["id"] }, { fechaCita: fechaCita, observacion, estado: estado });
            await appDataSource.getRepository("historial_usuario").save({ 
                usuario: req.params.idUser, 
                seccion: "RECLUTAMIENTO", 
                modulo: "CITAS", 
                descripcion: `MODIFICO CITA CON EL DNI: ${req.body.dni} E ID: ${cita.id}`, 
                accion: "MODIFICAR", fecha: new Date() 
            });
            return res.send({ message: "se ha modificado correctamente la cita y los datos de la persona!" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "error en el servidor!" });
        }
    }
);


router.put("/citas/reprogramar_by_id/:id/:idUser",
    param("id")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .withMessage("hubo un error en el parametro id!"),
    param("idUser")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el idUser"),
    checkSchema({
        fechaCita: {
            in: ["body"],
            isISO8601: true,
            toDate: true,
            notEmpty: true,
            errorMessage: "Los datos de la fecha de cita son invalidos!"
        },
    }),
    validateReq,
    async (req: Request, res: Response) => {
        try {
            const cita = await appDataSource.getRepository("cita").findOne({ where: { id: req.params["id"] }, relations: ["persona"] });
            if (!cita) return res.status(404).send({ message: "La cita no existe o no se encuentra en la base de datos!" });
            const { fechaCita } = req.body;

            await appDataSource.getRepository("cita").update({ id: cita.id }, { estado: "Reprogramada" });
            const { ...newCita } = { fechaCita: fechaCita, estado: "Pendiente", persona: cita["persona"], observacion: cita["observacion"] };
            const citaReprogramada: ICita = <ICita>(<unknown>{ ...newCita, eliminado: false });
            await appDataSource.getRepository("cita").save(citaReprogramada);
            await appDataSource.getRepository("historial_usuario").save({ 
                usuario: req.params.idUser, 
                seccion: "RECLUTAMIENTO", 
                modulo: "CITAS", 
                descripcion: `REPROGRAMO LA CITA CON EL DNI: ${cita.persona.dni} E ID: ${cita.id}`, 
                accion: "REPROGAMAR", fecha: new Date() 
            });
            return res.send({ message: "La cita fue reprogramada!" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).send({ message: "error en el servidor!" });
        }


    }
);



router.get("/citas/get_all_pending_dni/",
    async (_: Request, res: Response) => {
        try {
            const setList = new Set();
            const allDataCitas = await appDataSource.getRepository("cita").find({ relations: ["persona"], select: { persona: { dni: true } } });
            const allRegisterEmployeesDni = await appDataSource.getRepository("trabajador").find({ relations: ["cita", "cita.persona"] });
            const registeredDniSet = new Set(allRegisterEmployeesDni.map((trabajador: any) => trabajador.cita?.persona?.dni).filter((dni: string | undefined) => dni));

            allDataCitas.forEach((cita: any) => {
                if (!registeredDniSet.has(cita["persona"].dni)) setList.add(cita["persona"].dni);
            });

            return res.send(Array.from(setList));
        } catch (error: any) {
            return res.status(500).send({ message: error.toString() });
        }
    }
);

router.delete("/citas/delete/:id/:userId",
    param("userId")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el idUser"),
    param("id")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .withMessage("error en el campo de la id"),
    async (req: Request, res: Response) => {
        try {
            const citaTemp = await appDataSource.getRepository("cita").findOne({ where: { id: req.params.id }, relations: ["persona"] });
            if (!citaTemp) return res.status(403).send({ message: "La cita no existe!" });
            await appDataSource.getRepository("cita").update({ id: req.params["id"] }, { eliminado: true });
            await appDataSource.getRepository("historial_usuario").save({ 
                usuario: req.params.userId, 
                seccion: "RECLUTAMIENTO", 
                modulo: "CITAS", 
                descripcion: `ELIMINO LA CITA CON EL DNI: ${citaTemp.persona.dni} E ID: ${citaTemp.id}`, 
                accion: "ELIMINAR", 
                fecha: new Date() 
            });
            return res.send({ message: "Se ha eliminado correctamente la cita!!" });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

export default router;