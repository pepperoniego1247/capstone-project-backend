import { Router, Request, Response } from "express";
import { checkSchema, param } from "express-validator";
import { validateReq } from "../middlewares/validateRequest";
import { appDataSource } from "../dataBase";
import multer from "multer";
import { ITrabajador, IUPersonaTrabajador } from "../interfaces/trabajadores";
import { uploadFileToFirebase } from "../scripts/subirImagen";
import { Between, Equal, ObjectLiteral } from "typeorm";
import { Console } from "console";
import { validationToken } from "../middlewares/token";
import { generatePdf } from "../scripts/generatePdf";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/trabajadores/registrar-nuevo/:idUser",
    upload.single("file"),
    param("idUser")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id de usuario"),
    checkSchema({
        //*persona
        dni: {
            in: "body",
            isString: true,
            notEmpty: true,
            errorMessage: "El campo dni es incorrecto!"
        },
        //*trabajador NYA(2 DIGITOS)(8 DIGITOS) NYA01-7664500
        codigoTrabajador: {
            in: "body",
            isString: true,
            // notEmpty: true,
            // matches: {
            //     options: /^NYA\d{2}-\d{8}$/,
            //     errorMessage: "El formato del codigo debe ser NYA{numero de folder}-{numero de dni}!."
            // },
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo codigo trabajador es obligatorio!");
                    }
                    return true;
                }
            },
            errorMessage: "El campo trabajador tiene un error!"
        },
        //*trabajador
        fechaInscripcion: {
            in: "body",
            notEmpty: { errorMessage: "El campo fecha de inscripcion no puede estar vacio!" },
            // isDate: { errorMessage: "El campo fecha de inscripcion no tiene un formato valido!!" },
            // isISO8601: { errorMessage: "El campo fecha de inscripcion tiene que ser de formato ISO8601!" },
            isString: true,
            // toDate: true,
            errorMessage: "La fecha de inscripcion tiene datos incorrectos!."
        },
        //*trabajador
        evaluacionPsicologica: {
            in: "body",
            isString: true,
            notEmpty: true,
            custom: {
                options: (value: string) => value === "APTO" || value === "NO APTO" || value === "APTO CONDICIONAL"
            },
            errorMessage: "Error en el campo de evaluaciones psicologica!"
        },
        //*trabajador
        fechaNacimiento: {
            in: "body",
            isString: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo fecha de nacimiento es obligatorio!");
                    }
                    return true;
                }
            },
            errorMessage: "La fecha de nacimiento tiene datos incorrectos!."
        },
        //*trabajador
        edad: {
            in: ["body"],
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo edad es obligatorio!");
                    }
                    return true;
                }
            },
            isNumeric: true,
            errorMessage: "El campo de la edad debe ser numerico!"
        },
        //*trabajador
        departamentoNacimiento: {
            in: "body",
            isString: true,
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo departamento de nacimiento es obligatorio!");
                    }
                    return true;
                }
            },
            errorMessage: "El campo departamento tuvo un error!"
        },
        //*trabajador
        provinciaNacimiento: {
            in: "body",
            isString: true,
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo provincia de nacimiento es obligatorio!");
                    }
                    return true;
                }
            },
            errorMessage: "El campo departamento tuvo un error!"
        },
        //*trabajador
        distritoNacimiento: {
            in: "body",
            isString: true,
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo distrito de nacimiento es obligatorio!");
                    }
                    return true;
                }
            },
            errorMessage: "El campo departamento tuvo un error!"
        },
        //*trabajador
        ubicacionArchivo: {
            in: "body",
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de ubicacion de archivos! :("
        },
        //*trabajador
        folder: {
            in: "body",
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo folder es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "Error en el campo de folders!"
        },
        horaSalida: {
            in: ["body"],
            isString: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo hora salida es obligatorio!");
                    }
                    return true;
                }
            },
            errorMessage: "Error en el campo hora de salida"
        },
        horaIngreso: {
            in: ["body"],
            isString: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo hora ingreso es obligatorio!");
                    }
                    return true;
                }
            },
            errorMessage: "Error en el campo hora de entrada"
        },
        //*persona
        departamentoDomicilio: {
            in: "body",
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo departamento domicilio es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "Error en el campo departamento del domicilio!"
        },
        //*persona
        provinciaDomicilio: {
            in: "body",
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo provincia domicilio es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "Error en el campo provincia del domicilio!"
        },
        //*persona
        distritoDomicilio: {
            in: "body",
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo distrito domicilio es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "Error en el campo distrito del domicilio!"
        },
        //*persona
        referenciaDeDomicilio: {
            in: "body",
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo referencia de domicilio es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "Error en el campo referencia del domicilio!"
        },
        //*persona
        direccion: {
            in: "body",
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo direccion es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "Error en el campo direccion del domicilio!"
        },
        //*trabajador
        gradoInstruccion: {
            in: "body",
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo grado instruccion es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "El campo de grado de instruccion es invalida!"
        },
        //*trabajador
        nivelEstudios: {
            in: "body",
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo nivel de estudios es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "Error en el campo nivel de estudios del domicilio!"
        },
        mensaje: {
            in: 'body',
            isString: true,
            notEmpty: true,
            errorMessage: "Ocurrio un error en el campo mensaje!"
        },
        //*trabajador
        puesto: {
            in: "body",
            // notEmpty: { errorMessage: "El campo puestos no puede estar vacio" },
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo puesto es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "Ocurrio un error en el campo de puestos!"
        },
        //*trabajador
        modalidad: {
            in: "body",
            // notEmpty: { errorMessage: "El campo modalidades no puede estar vacio" },
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo modalidad es obligatorio!");
                    }
                    return true;
                }
            },
            isString: true,
            errorMessage: "Ocurrio un error en el campo de modalidades!"
        },
        //*trabajador
        pretencionSalarial: {
            in: "body",
            // isNumeric: { errorMessage: "La pretencion salarial debe ser numerica!" },
            // notEmpty: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "NO APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo pretencion salarial es obligatorio!");
                    }
                    return true;
                }
            },
            errorMessage: "Error en pretencion salarial"
        },
        motivoNoAC: {
            in: "body",
            // isString: true,
            // optional: true,
            custom: {
                options: (value, { req }) => {
                    if (req.body.evaluacionPsicologica === "APTO") {
                        return true;
                    }

                    if (!value) {
                        throw new Error("El campo motivo es obligatorio!");
                    }
                    return true;
                }
            },
            errorMessage: "El motivo del NO APTO O APTO CONDICIONAL tiene un formato incorrecto!"
        }
    }),
    validateReq,
    validationToken,
    async (req: Request, res: Response) => {
        try {
            console.log(req.body.motivoNoAC);
            const employeeAlreadyExists = await appDataSource.getRepository("trabajador").findOne({ where: { cita: { persona: { dni: req.body["dni"] } } } });
            if (employeeAlreadyExists) return res.status(403).send({ message: "El trabajador ya esta en el sistema." });
            const { departamentoDomicilio, provinciaDomicilio, distritoDomicilio, referenciaDeDomicilio, direccion, ...rest } = req.body;

            const horaIngreso = new Date(req.body["horaIngreso"]);
            const horaSalida = new Date(req.body["horaSalida"]);
            
            const ingresoHoras = horaIngreso.getHours();
            const ingresoMinutos = horaIngreso.getMinutes();
            
            const salidaHoras = horaSalida.getHours();
            const salidaMinutos = horaSalida.getMinutes();
            
            // Verificar si las horas y minutos son iguales
            if (ingresoHoras === salidaHoras && ingresoMinutos === salidaMinutos) {
              return res.status(403).send({ message: "La hora de ingreso y salida tienen tiempos iguales!" });
            }
            
            // Verificar que la hora de salida no sea menor a la hora de ingreso
            if (salidaHoras < ingresoHoras || (salidaHoras === ingresoHoras && salidaMinutos < ingresoMinutos)) {
              return res.status(403).send({ message: "La hora de salida no puede ser menor que la hora de ingreso!" });
            }

            if (!req.body.ubicacionArchivo || !req.body.folder || !req.body.codigoTrabajador)
                return res.status(403).send({ message: "Ocurrio un error en el campo ubicacion de archivo, folder o codigo trabajador!" });

            const { ...updatePersona } = {
                departamentoDomicilio: departamentoDomicilio,
                provinciaDomicilio: provinciaDomicilio,
                distritoDomicilio: distritoDomicilio,
                referenciaDeDomicilio: referenciaDeDomicilio,
                direccion: direccion
            };

            const lastCita = await appDataSource.getRepository("cita").find({ where: { persona: { dni: req.body["dni"] } } });

            const updatedPersona: IUPersonaTrabajador = <IUPersonaTrabajador>(<unknown>{ ...updatePersona });
            await appDataSource.getRepository("persona").update({ dni: req.body["dni"] }, { ...updatedPersona });
            const { puesto, modalidad, folder, ubicacionArchivo, ...data } = rest;

            const usuario = await appDataSource.getRepository("usuario").findOne({ where: { id: req.params.idUser } });
            if (!usuario) return res.status(403).send({ message: "Ocurrio un error con el usuario!" });

            await appDataSource.getRepository("cita").update({ id: lastCita[lastCita.length - 1]["id"] }, { estado: "Finalizado" });

            const folderTemp = await appDataSource.getRepository("folder").findOne({ where: { descripcion: folder } });
            const ubicacionArchivoTemp = await appDataSource.getRepository("ubicacion_archivo").findOne({ where: { descripcion: ubicacionArchivo } });

            const { ...newTrabajador } = data;
            const createdEmployee: ITrabajador = <ITrabajador>(<unknown>{ ...newTrabajador, cita: lastCita[lastCita.length - 1], folder: folderTemp, ubicacionArchivo: ubicacionArchivoTemp });
            const newEmployee = await appDataSource.getRepository("trabajador").save({ ...createdEmployee, eliminado: false, usuario });

            for (const data of (puesto as string).split(",")) {
                const puesto = await appDataSource.getRepository("puesto").findOne({ where: { descripcion: data } });
                await appDataSource.getRepository("puesto_trabajador").save({ puesto: puesto, trabajador: newEmployee });
            };

            for (const data of (modalidad as string).split(",")) {
                const modalidad = await appDataSource.getRepository("modalidad").findOne({ where: { descripcion: data } });
                await appDataSource.getRepository("modalidad_trabajador").save({ modalidad: modalidad, trabajador: newEmployee });
            };
            // //TODO =======================

            if (req.file) {
                const urlPhoto = await uploadFileToFirebase(req, "files", `${req.body.codigoTrabajador}`);
                await appDataSource.getRepository("trabajador").update({ id: newEmployee["id"] }, { fotoTrabajador: urlPhoto });
            }

            await appDataSource.getRepository("historial_usuario").save({
                usuario: req.params.idUser,
                seccion: "RECLUTAMIENTO",
                modulo: "TRABAJADORES",
                descripcion: `REGISTRO A UN TRABAJADOR CON EL DNI: ${req.body.dni} E ID: ${newEmployee.id}`,
                accion: "AGREGAR",
                fecha: new Date()
            });

            return res.send({ message: "Se ha registrado correctamente el trabajador!" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: error });
        }
    }
);

router.get("/trabajadores/get_all/",
    async (_: Request, res: Response) => {
        try {
            const data = await appDataSource.getRepository("trabajador").find({ where: { eliminado: false }, relations: ["cita", "cita.persona", "puestoTrabajador.puesto", "modalidadTrabajador.modalidad", "ubicacionArchivo", "folder"] });
            return res.send(data);
        } catch (error) {
            console.log(error)
            return res.status(500).send({ message: error });
        }
    }
);

router.get("/trabajadores/get_all/dni/",
    async (req: Request, res: Response) => {
        try {
            const data = await appDataSource.getRepository("trabajador").find({ relations: ["cita", "cita.persona"], where: { eliminado: false } });
            const list = data.map((element: any) => element["cita"]["persona"]["dni"]);
            return res.send(list);
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);
router.put("/trabajadores/editar/:id/:idUser",
    upload.single("file"),
    param("idUser")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id de usuario"),
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id de usuario"),
    checkSchema({
        codigoTrabajador: {
            in: "body",
            isString: true,
            notEmpty: true,
            matches: {
                options: /^NYA\d{2}-\d{8}$/,
                errorMessage: "El formato del codigo debe ser NYA{numero de folder}-{numero de dni}!",
            },
            errorMessage: "El campo trabajador tiene un error!"
        },
        fechaInscripcion: {
            in: "body",
            isString: true,
            notEmpty: { errorMessage: "El campo fecha de inscripcion no puede estar vacio!" },
            toDate: true,
            errorMessage: "La fecha de inscripcion tiene datos incorrectos!."
        },
        observacion: {
            in: ["body"],
            optional: true,
            isString: true,
            errorMessage: "Ocurrio un error en el campo de observaciones!"
        },
        motivoNoAC: {
            in: "body",
            isString: true,
            optional: true,
            errorMessage: "El motivo del NO APTO O APTO CONDICIONAL es tiene un formato incorrecto!"
        },
        mensaje: {
            in: 'body',
            isString: true,
            notEmpty: true,
            errorMessage: "Ocurrio un error en el campo mensaje!"
        },
        evaluacionPsicologica: {
            in: "body",
            isString: true,
            notEmpty: true,
            custom: {
                options: (value: string) => value === "APTO" || value === "NO APTO" || value === "APTO CONDICIONAL"
            },
            errorMessage: "Error en el campo de evaluaciones psicologica!"
        },
        fechaNacimiento: {
            in: "body",
            notEmpty: true,
            isString: true,
            errorMessage: "La fecha de nacimiento tiene datos incorrectos!."
        },
        edad: {
            in: ["body"],
            notEmpty: true,
            isNumeric: true,
            errorMessage: "El campo de la edad debe ser numerico!"
        },
        departamentoNacimiento: {
            in: "body",
            isString: true,
            notEmpty: true,
            errorMessage: "El campo departamento tuvo un error!"
        },
        provinciaNacimiento: {
            in: "body",
            isString: true,
            notEmpty: true,
            errorMessage: "El campo provincia tuvo un error!"
        },
        distritoNacimiento: {
            in: "body",
            isString: true,
            notEmpty: true,
            errorMessage: "El campo distrito tuvo un error!"
        },
        ubicacionArchivo: {
            in: "body",
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de ubicacion de archivos!"
        },
        folder: {
            in: "body",
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de folders!"
        },
        horaSalida: {
            in: ["body"],
            isISO8601: true,
            toDate: true,
            errorMessage: "Error en el campo hora de salida"
        },
        horaIngreso: {
            in: ["body"],
            isISO8601: true,
            toDate: true,
            errorMessage: "Error en el campo hora de entrada"
        },
        gradoInstruccion: {
            in: "body",
            notEmpty: true,
            isString: true,
            errorMessage: "El campo de grado de instruccion es invalido!"
        },
        nivelEstudios: {
            in: "body",
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de nivel de estudios!"
        },
        puesto: {
            in: "body",
            notEmpty: true,
            isArray: true,
            errorMessage: "Ocurrio un error en el campo de puestos!"
        },
        modalidad: {
            in: "body",
            notEmpty: true,
            isArray: true,
            errorMessage: "Ocurrio un error en el campo de modalidades!"
        },
        pretencionSalarial: {
            in: "body",
            isNumeric: true,
            notEmpty: true,
            errorMessage: "La pretencion salarial debe ser numerica!"
        }
    }),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!req.body.ubicacionArchivo || !req.body.folder || !req.body.codigoTrabajador)
                return res.status(403).send({ message: "Ocurrio un error en el campo ubicacion de archivo, folder o codigo trabajador!" });


            // Verificar si el trabajador existe y cargar relaciones
            const trabajadorRepository = appDataSource.getRepository("trabajador");
            const existingTrabajador = await trabajadorRepository.findOne({
                where: { id },
                relations: ["cita", "cita.persona"] // Cargar las relaciones necesarias
            });
            if (!existingTrabajador) {
                return res.status(404).send({ message: "Trabajador no encontrado." });
            }
            if (!existingTrabajador.cita || !existingTrabajador.cita.persona) {
                return res.status(404).send({ message: "La cita o persona asociada al trabajador no fue encontrada." });
            }

            // Extraer solo los campos editables de Persona desde req.body
            const {
                referenciaDeDomicilio,
                provinciaDomicilio,
                departamentoDomicilio,
                distritoDomicilio,
                direccion,
                // Resto de los campos que pertenecen a `Trabajador`
                whatsapp, telefono, modoDeContacto, folderCodigo,
                ...trabajadorFields
            } = req.body;

            // Actualizar solo los campos permitidos de Persona
            const updatedPersona = {
                referenciaDeDomicilio,
                provinciaDomicilio,
                departamentoDomicilio,
                distritoDomicilio,
                direccion
            };
            await appDataSource.getRepository("persona").update(
                { id: existingTrabajador.cita.persona.id },
                updatedPersona
            );

            const { puesto, modalidad, folder, ubicacionArchivo, ...trabajadorData } = trabajadorFields;
            console.log(req.body.ubicacionArchivo);

            const folderTemp = await appDataSource.getRepository("folder").findOne({ where: { descripcion: folder } });
            const ubicacionArchivoTemp = await appDataSource.getRepository("ubicacion_archivo").findOne({ where: { descripcion: ubicacionArchivo } });

            const updatedTrabajador = {
                ...trabajadorData,
                folder: folderTemp,
                ubicacionArchivo: ubicacionArchivoTemp
            };
            await trabajadorRepository.update(id, updatedTrabajador);

            await appDataSource.getRepository("puesto_trabajador").delete({ trabajador: existingTrabajador });
            for (const data of (puesto as string).split(",")) {
                const puestoEntity = await appDataSource.getRepository("puesto").findOne({ where: { descripcion: data } });
                await appDataSource.getRepository("puesto_trabajador").save({ puesto: puestoEntity, trabajador: existingTrabajador });
            }

            await appDataSource.getRepository("modalidad_trabajador").delete({ trabajador: existingTrabajador });
            for (const data of (modalidad as string).split(",")) {
                const modalidadEntity = await appDataSource.getRepository("modalidad").findOne({ where: { descripcion: data } });
                await appDataSource.getRepository("modalidad_trabajador").save({ modalidad: modalidadEntity, trabajador: existingTrabajador });
            }

            if (req.file) {
                const urlPhoto = await uploadFileToFirebase(req, "files", `${req.body.codigoTrabajador}`);
                await trabajadorRepository.update(id, { fotoTrabajador: urlPhoto });
            }

            await appDataSource.getRepository("historial_usuario").save({
                usuario: req.params.idUser,
                seccion: "RECLUTAMIENTO",
                modulo: "TRABAJADORES",
                descripcion: `MODIFICO DATOS DE UN TRABAJADOR CON EL DNI: ${existingTrabajador.cita.persona.dni} E ID: ${existingTrabajador.id}`,
                accion: "MODIFICAR",
                fecha: new Date()
            });

            return res.send({ message: "Trabajador actualizado correctamente!" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: error });
        }
    }
);

router.get("/trabajador/get_quantity/",
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const counter = await appDataSource.getRepository("trabajador").count({ where: { eliminado: false } });

            return res.send({ counter });
        } catch (error) {
            return res.status(500).send({ message: "error en el servidor!" });
        }
    }
);

router.delete("/trabajador/delete/:id/:idUser",
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
            const trabajador = await appDataSource.getRepository("trabajador").findOne({ where: { id: req.params.id }, relations: ["cita", "cita.persona"] });
            if (!trabajador) return res.status(403).send({ message: "El trabajador no existe!" });
            await appDataSource.getRepository("trabajador").update({ id: req.params["id"] }, { eliminado: true });
            await appDataSource.getRepository("historial_usuario").save({
                usuario: req.params.idUser,
                seccion: "RECLUTAMIENTO",
                modulo: "TRABAJADORES",
                descripcion: `ELIMINO A UN TRABAJADOR CON EL DNI: ${trabajador.cita.persona.dni} E ID: ${req.params.id}`,
                accion: "ELIMINAR",
                fecha: new Date()
            });
            return res.send({ message: "Se ha eliminado correctamente el trabajador!!" });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.post("/trabajador/buscar-empleo/:id",
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true }),
    checkSchema({
        modalidad: {
            in: ["body"],
            isBoolean: true,
            notEmpty: true
        },
        puesto: {
            in: ["body"],
            isBoolean: true,
            notEmpty: true    
        },
        sueldo: {
            in: ["body"],
            isBoolean: true,
            notEmpty: true    
        }
    }),
    validationToken,
    validateReq,
    async (req: Request, res: Response) => {
        try {
            const trabajador = await appDataSource.getRepository("trabajador").findOne({
                where: { id: req.params["id"] },
                relations: ["puestoTrabajador", "modalidadTrabajador", "puestoTrabajador.puesto", "modalidadTrabajador.modalidad", "cita", "cita.persona"]
            });

            if (!trabajador) return res.status(403).send({ message: "El trabajador no se encontro!" });
            if (trabajador["evaluacionPsicologica"] === "NO APTO") return res.status(403).send({ message: "No se puede buscar pedidos para los trabajadores NO APTOS!" });
            trabajador["puestoTrabajador"] = trabajador.puestoTrabajador.map((puesto: ObjectLiteral) => puesto["puesto"]);
            trabajador["modalidadTrabajador"] = trabajador.modalidadTrabajador.map((puesto: ObjectLiteral) => puesto["modalidad"]);
            // console.log(trabajador);

            const { pretencionSalarial, puestoTrabajador, modalidadTrabajador } = trabajador;

            if (pretencionSalarial.length === 0) return res.status(403).send({ message: "Este trabajador no tiene una pretencion salarial y puede ocasionar errores en esta busqueda!" });

            console.log(req.body);
            const { modalidad, puesto, sueldo } = req.body;
            
            const pedidos = await appDataSource.getRepository("pedido").find({
                where: {
                    ...( sueldo ? { sueldo: pretencionSalarial.includes(",") ? Between(pretencionSalarial.split(",")[0], pretencionSalarial.split(",")[1]) : Equal(pretencionSalarial) } : undefined ),
                    ...( puesto ? { puesto: puestoTrabajador } : undefined ),
                    ...( modalidad ? { modalidad: modalidadTrabajador } : undefined ),
                    estado: "Pendiente",
                    ordenDeServicio: true,
                    eliminado: false
                },
                relations: ["empleador", "empleador.persona", "horarioPedido", "modalidad", "puesto"]
            });


            const findConvenio = await appDataSource.getRepository("convenio").findOne({ where: { trabajador: { id: trabajador.id }, estado: "COLOCACION" } });

            const listPedidos = pedidos.map((pedido: ObjectLiteral) => ({
                foto: pedido.empleador.fotoUrl ?? "",
                nombres: pedido.empleador.persona.nombres,
                apellidoPaterno: pedido.empleador.persona.apellidoPaterno,
                apellidoMaterno: pedido.empleador.persona.apellidoMaterno,
                whatsapp: pedido.empleador.persona.whatsapp,
                edadMinima: pedido.edadMinima,
                edadMaxima: pedido.edadMaxima,
                rutina: pedido.rutina,
                movilidad: pedido.movilidad,
                sueldo: pedido.sueldo,
                modalidad: pedido.modalidad.descripcion,
                puesto: pedido.puesto.descripcion
            }));

            if (pedidos.length === 0) return res.status(403).send({ message: "No se ha encontrado ninguna posibilidad de trabajo para el trabajador!" });
            return res.send({ inConvenio: findConvenio ? true : false, listPedidos });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: error });
        }
    }
);

router.get("/trabajador/generate-pdf/:id",
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true }),
    validateReq,
    async (req: Request, res: Response) => {
        try {
            const trabajador = await appDataSource.getRepository("trabajador").findOne({
                where: { id: req.params.id, eliminado: false }, relations: [
                    "cita", "cita.persona", "ubicacionArchivo"
                ]
            });

            if (!trabajador) return res.status(403).send({ message: "El trabajador no se encontro!" });
            const { codigoTrabajador, gradoInstruccion, nivelEstudios,
                evaluacionPsicologica,
                horaIngreso,
                horaSalida,
                fechaInscripcion,
                pretencionSalarial,
                departamentoNacimiento,
                distritoNacimiento,
                provinciaNacimiento,
                fechaNacimiento,
                ubicacionArchivo,
                edad,
                fotoTrabajador,
                cita,
            } = trabajador;

            const { persona } = cita;

            const {
                dni,
                nombres,
                apellidoMaterno,
                apellidoPaterno,
                telefono,
                whatsapp,
                referenciaDeDomicilio,
                departamentoDomicilio,
                provinciaDomicilio,
                distritoDomicilio,
                direccion
            } = persona;


            const data = {
                codigoTrabajador,
                ubicacionArchivo: ubicacionArchivo.descripcion,
                gradoInstruccion,
                nivelEstudios,
                evaluacionPsicologica,
                horaIngreso,
                horaSalida,
                fechaInscripcion,
                pretencionSalarial,
                departamentoNacimiento,
                distritoNacimiento,
                provinciaNacimiento,
                fechaNacimiento,
                edad,
                fotoTrabajador,
                nombres,
                dni,
                apellidoMaterno,
                apellidoPaterno,
                telefono,
                whatsapp,
                referenciaDeDomicilio,
                departamentoDomicilio,
                provinciaDomicilio,
                distritoDomicilio,
                direccion
            }

            const pdf = await generatePdf(data, "../extras/informeTrabajador.ejs");

            res.contentType("application/pdf");
            res.setHeader("Content-Disposition", `inline; filename=Informe_Trabajador_${codigoTrabajador}_${nombres}_${apellidoPaterno} ${apellidoMaterno}`);

            return res.send(pdf);
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);


export default router;