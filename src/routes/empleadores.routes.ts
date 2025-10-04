import { Request, Response, Router } from "express";
import { checkSchema, param } from "express-validator";
import { validateReq } from "../middlewares/validateRequest";
import { appDataSource } from "../dataBase";
import { consultarDNI } from "../api/sunat/requests";
import { IPersonaEmpleador } from "../interfaces/persona";
import { ICreateEmployeer } from "../interfaces/empleador";
import { capitalizarNombres } from "../scripts/capitalizarNombres";
import multer from "multer";
import { uploadFileToFirebase } from "../scripts/subirImagen";
import { validationToken } from "../middlewares/token";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function toBoolean(value: string) {
    return value === "false" ? false : Boolean(value);
}

router.post("/empleadores/registrar-nuevo/:id",
    upload.single("file"),
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id de usuario"),
    checkSchema({
        dni: {
            in: "body",
            isNumeric: true,
            notEmpty: true,
            isLength: {
                options: { max: 8, min: 8 },
                errorMessage: "El dni debe tener 8 digitos"
            },
            errorMessage: "El campo dni es incorrecto!"
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
        quienRefirio: {
            in: ['body'],
            optional: true,
            isString: true,
            errorMessage: "Dato invalido en quien referio, debe ser una cadena de texto valida!"
        },
        telefono: {
            in: ["body"],
            isMobilePhone: true,
            notEmpty: true,
            errorMessage: "Datos invalidos para el numero de telefono!."
        },
        observacion: {
            in: ["body"],
            optional: true,
            isString: true,
            errorMessage: "Ocurrio un error en el campo de observaciones!"
        },
        whatsapp: {
            in: ["body"],
            isMobilePhone: true,
            optional: true,
            errorMessage: "Datos invalidos para el numero de whatsapp!."
        },
        //*EMPLEADOR
        correo: {
            in: ["body"],
            isEmail: true,
            optional: true,
            errorMessage: "Correo electronico invalido!"
        },
        //*EMPLEADOR
        transportePublico: {
            in: ["body"],
            isString: true,
            optional: true,
            errorMessage: "Ocurrio un error con los datos del transporte publico!"
        },
        //*EMPLEADOR
        excluido: {
            in: ["body"],
            isBoolean: true,
            notEmpty: true,
            errorMessage: "Error en el campo de exclusion!"
        },
        //* PERSONA
        modoDeContacto: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo de modo de contacto!"
        },
        departamentoDomicilio: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Ocurrio un error en el campo del departamento del domicilio!"
        },
        provinciaDomicilio: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Ocurrio un error en el campo de provincia!"
        },
        distritoDomicilio: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Ocurrio un error en el campo de distrito!"
        },
        direccion: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo de direccion!"
        },
        referenciaDomicilio: {
            in: ["body"],
            isString: true,
            optional: true,
            errorMessage: "Datos en la referencia de domicilio incorrectos!"
        }
    }),
    validateReq,
    validationToken,
    async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            const employeerAlreadyExists = await appDataSource.getRepository("empleador").findOne({ where: { persona: { dni: req.body["dni"] } } });
            if (employeerAlreadyExists) return res.status(403).send({ message: "El empleador ya existe!" });

            let persona = await appDataSource.getRepository("persona").findOne({ where: { dni: req.body["dni"] } });
            if (persona) return res.status(403).send({ message: "La persona ya esta registrada!" });

            const usuario = await appDataSource.getRepository("usuario").findOne({ where: { id: req.params.id} });
            if (!usuario) return res.status(403).send({ message: "Ocurrio un error con el usuario!" });

            const { correo, transportePublico, excluido, quienRefirio, observacion, nombres, apellidoMaterno, apellidoPaterno, ...rest } = req.body;

            const dniResponse = {
                nombres,
                apellidoMaterno,
                apellidoPaterno
            }

            if (req.body.dni.length !== 8) return res.status(403).send();

            // const dniResponse = await consultarDNI(req.body["dni"]);
            // if (!dniResponse) return res.status(404).send({ message: "La persona no se encontro en reniec!" });

            const { ...newPerson } = { ...capitalizarNombres(dniResponse), ...req.body };
            const createdPerson: IPersonaEmpleador = <IPersonaEmpleador>(<unknown>{ ...newPerson });
            persona = await appDataSource.getRepository("persona").save(createdPerson);

            const { ...newEmployeer } = { correo: correo, transportePublico: transportePublico, observacion, excluido: toBoolean(excluido), eliminado: false, quienRefirio }
            const createdEmployeer: ICreateEmployeer = <ICreateEmployeer>(<unknown>{ ...newEmployeer });
            const empleador = await appDataSource.getRepository("empleador").save({ ...createdEmployeer, persona: persona, usuario });

            await appDataSource.getRepository("historial_usuario").save({
                usuario: req.params.id,
                seccion: "RECLUTAMIENTO",
                modulo: "EMPLEADORES",
                descripcion: `REGISTRO A UN EMPLEADOR CON EL DNI: ${req.body.dni} E ID: ${empleador.id}`,
                accion: "AGREGAR",
                fecha: new Date()
            });

            if (req.file) {
                const urlPhoto = await uploadFileToFirebase(req, "files", `${empleador.persona.nombres}-${empleador.persona.apellidoPaterno} ${empleador.persona.apellidoMaterno}`);
                await appDataSource.getRepository("empleador").update({ id: empleador.id }, { fotoUrl: urlPhoto });
            }

            return res.send({ message: "Se ha creado correctamente al nuevo empleador!" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Error en el servidor" });
        }
    }
);

router.get("/empleadores/get_all/",
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const data = await appDataSource.getRepository("empleador").find({ where: { eliminado: false }, relations: ["persona"] });
            return res.send(data);
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.get("/empleadores/get_all/dni/",
    async (req: Request, res: Response) => {
        try {
            const data = await appDataSource.getRepository("empleador").find({ relations: ["persona"], where: { eliminado: false } });
            const list = data.map((element: any) => element["persona"]["dni"]);
            return res.send(list);
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.put("/empleadores/edit_by_id/:id/:idUser",
    upload.single("file"),
    param("idUser")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id de usuario"),
    param("id")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .withMessage("hubo un error en el parametro id!"),
    checkSchema({
        dni: {
            in: "body",
            isNumeric: true,
            notEmpty: true,
            isLength: {
                options: { max: 8, min: 8 },
                errorMessage: "El dni debe tener 8 digitos"
            },
            errorMessage: "El campo dni es incorrecto!"
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
        observacion: {
            in: ["body"],
            optional: true,
            isString: true,
            errorMessage: "Ocurrio un error en el campo de observaciones!"
        },
        quienRefirio: {
            in: ['body'],
            optional: true,
            isString: true,
            errorMessage: "Dato invalido en quien referio, debe ser una cadena de texto valida!"
        },
        telefono: {
            in: ["body"],
            isMobilePhone: true,
            notEmpty: true,
            errorMessage: "Datos invalidos para el numero de telefono!."
        },
        whatsapp: {
            in: ["body"],
            isMobilePhone: true,
            optional: true,
            errorMessage: "Datos invalidos para el numero de whatsapp!."
        },
        correo: {
            in: ["body"],
            isEmail: true,
            optional: true,
            errorMessage: "Correo electronico invalido!"
        },
        transportePublico: {
            in: ["body"],
            isString: true,
            optional: true,
            errorMessage: "Ocurrio un error con los datos del transporte publico!"
        },
        excluido: {
            in: ["body"],
            isBoolean: true,
            notEmpty: true,
            errorMessage: "Error en el campo de exclusion!"
        },
        modoDeContacto: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo de modo de contacto!"
        },
        departamentoDomicilio: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Ocurrio un error en el campo del departamento del domicilio!"
        },
        provinciaDomicilio: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Ocurrio un error en el campo de provincia!"
        },
        distritoDomicilio: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Ocurrio un error en el campo de distrito!"
        },
        direccion: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo de direccion!"
        },
        referenciaDeDomicilio: {
            in: ["body"],
            isString: true,
            optional: true,
            errorMessage: "Datos en la referencia de domicilio incorrectos!"
        }

    }),
    validateReq,
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const empleador = await appDataSource.getRepository("empleador").findOne({ where: { id: req.params["id"] }, relations: ["persona"] });
            if (!empleador) return res.status(404).send({ message: "El empleador no existe o no se encuentra en la base de datos" });

            const { correo, transportePublico, excluido, quienRefirio, observacion } = req.body;

            delete req.body["correo"];
            delete req.body["observacion"];
            delete req.body["transportePublico"];
            delete req.body["excluido"];
            delete req.body["quienRefirio"];

            let dataNombresPersona = {};
            if (req.body.dni.length !== 8) return res.status(403).send({ message: "El dni debe tener 8 digitos" });

            if (empleador.persona.dni !== req.body["dni"] && req.params.idUser !== "1") {
                const dniResponse = await consultarDNI(req.body["dni"]);
                dataNombresPersona = dniResponse ? { ...capitalizarNombres(dniResponse) } : {};
            }

            await appDataSource.getRepository("persona").update({ id: empleador.persona.id }, { ...dataNombresPersona, ...req.body });
            
            await appDataSource.getRepository("empleador").update({ id: empleador["id"] }, { correo: correo, transportePublico: transportePublico, excluido: toBoolean(excluido), observacion, quienRefirio: quienRefirio });

            await appDataSource.getRepository("historial_usuario").save({
                usuario: req.params.idUser,
                seccion: "RECLUTAMIENTO",
                modulo: "EMPLEADORES",
                descripcion: `MODIFICO A UN EMPLEADOR CON EL DNI: ${empleador.persona.dni} E ID: ${empleador.id}`,
                accion: "MODIFICAR",
                fecha: new Date()
            });

            if (req.file) {
                const urlPhoto = await uploadFileToFirebase(req, "files", `${empleador.persona.nombres}-${empleador.persona.apellidoPaterno} ${empleador.persona.apellidoMaterno}`);
                await appDataSource.getRepository("empleador").update({ id: empleador.id }, { fotoUrl: urlPhoto });
            }

            return res.send({ message: "el empleador se modifico con exito" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).send({ message: "error en el servidor" });
        }
    }
);


router.delete("/empleadores/delete/:id",
    param("id")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .withMessage("error en el campo de la id"),
    async (req: Request, res: Response) => {
        try {
            await appDataSource.getRepository("empleador").update({ id: req.params["id"] }, { eliminado: true });
            return res.send({ message: "Se ha eliminado correctamente al Empleador!" });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.delete("/empleadores/delete/:id/:idUser",
    param("idUser")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id de usuario"),
    param("id")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .withMessage("error en el campo de la id"),
    async (req: Request, res: Response) => {
        try {
            const empleador = await appDataSource.getRepository("empleador").findOne({ where: { id: req.params.id }, relations: ["persona"] })
            if (!empleador) return res.status(403).send({ message: "El empleador no existe!" });
            await appDataSource.getRepository("empleador").update({ id: req.params["id"] }, { eliminado: true });
            await appDataSource.getRepository("historial_usuario").save({
                usuario: req.params.idUser,
                seccion: "RECLUTAMIENTO",
                modulo: "EMPLEADORES",
                descripcion: `ELIMINO A UN EMPLEADOR CON EL DNI: ${empleador.persona.dni} E ID: ${empleador.id}`,
                accion: "ELIMINAR",
                fecha: new Date()
            });
            return res.send({ message: "Se ha eliminado correctamente al Empleador!" });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.get("/empleadores/get_data/:dni",
    param("dni")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .isLength({ min: 8, max: 8 })
        .withMessage("El parametro no cumple con los parametros, debe ser numerico y de una longitud de 8 digitos maximo y minimo."),
    validateReq,
    async (req: Request, res: Response) => {
        try {
            const empleador = await appDataSource.getRepository("empleador").findOne({ where: { persona: { dni: req.params.dni } }, relations: ["persona"] });
            if (!empleador) return res.status(403).send({ message: "El empleador no se encontro!" });

            return res.send({ nombres: empleador.persona["nombres"], apellidoPaterno: empleador.persona["apellidoPaterno"], apellidoMaterno: empleador.persona["apellidoMaterno"], direccion: empleador.persona.direccion, referenciaDeDomicilio: empleador.persona.referenciaDeDomicilio });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.get("/empleadores/get-count/",
    async (req: Request, res: Response) => {
        try {
            const count = await appDataSource.getRepository("empleador").count({ where: { eliminado: false } });
            return res.send({ count });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

export default router;