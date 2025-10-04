import { Router, Response, Request } from "express";
import { check, checkSchema, param } from "express-validator";
import { validateReq } from "../middlewares/validateRequest";
import * as dotenv from "dotenv";
import { appDataSource } from "../dataBase";
import { IHorario, IPedido, IUPedido } from "../interfaces/pedidos";
import { Between, In, LessThan, ObjectLiteral } from "typeorm";
import * as jwt from "jsonwebtoken";
import { validationToken } from "../middlewares/token";
import { generatePdf } from "../scripts/generatePdf";

const router = Router();
dotenv.config();

router.post("/pedidos/register/:idUser",
    param("idUser")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id de usuario"),
    checkSchema({
        dniEmpleador: {
            in: ["body"],
            notEmpty: true,
            isLength: { options: { max: 8, min: 8 } },
            isNumeric: true,
            errorMessage: "Error en el campo de dni de empleador!"
        },
        modalidad: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de modalidad!",
        },
        tipoDomicilio: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de tipo de domicilio!",
        },
        estadoPedido: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de estado del pedido!",
        },
        tipoEntrevista: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de tipo de entrevista!",
        },
        periocidad: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de tipo de periocidad!",
        },
        puesto: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de puesto!",
        },
        rutina: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de rutina!"
        },
        fechaInicio: {
            in: "body",
            notEmpty: { errorMessage: "El campo fecha de inicio no puede estar vacio!" },
            // isDate: { errorMessage: "El campo fecha de inicio no tiene un formato valido!!" },
            isISO8601: { errorMessage: "El campo fecha de inicio tiene que ser de formato ISO8601!" },
            toDate: true,
            errorMessage: "La fecha de inicio tiene datos incorrectos!."
        },
        funciones: {
            in: ["body"],
            notEmpty: true,
            isArray: true,
            custom: {
                options: (value) => Array.isArray(value) && value.length > 0,
                errorMessage: "El campo funciones no debe estar vacío!"
            },
            errorMessage: "Error en el campo de funciones!"
        },
        edadMinima: {
            in: ["body"],
            isNumeric: {
                errorMessage: "La edad mínima debe ser un número entero."
            },
            notEmpty: {
                errorMessage: "El campo de la edad mínima no puede estar vacío."
            },
            custom: {
                options: (value) => value >= 18 && value <= 55,
                errorMessage: "La edad mínima debe estar entre 18 y 55."
            }
        },
        edadMaxima: {
            in: ["body"],
            isNumeric: {
                errorMessage: "La edad máxima debe ser un número entero."
            },
            notEmpty: {
                errorMessage: "El campo de la edad máxima no puede estar vacío."
            },
            custom: {
                options: (value) => value >= 18 && value <= 55,
                errorMessage: "La edad máxima debe estar entre 18 y 55."
            }
        },
        horasSemanales: {
            in: ["body"],
            isNumeric: true,
            notEmpty: true,
            errorMessage: "Error en el campo de las horas diarias!!"
        },
        lunes: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Lunes!"
        },
        martes: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Martes!"
        },
        miercoles: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Miercoles!"
        },
        jueves: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Jueves!"
        },
        viernes: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Viernes!"
        },
        sabado: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Sabado!"
        },
        domingo: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Domingo!"
        },
        sueldo: {
            in: ["body"],
            isNumeric: {
                errorMessage: "El sueldo debe ser numerico!!."
            },
            notEmpty: {
                errorMessage: "El campo sueldo no puede estar vacío."
            },
            custom: {
                options: (value) => value >= 50 && value <= 3000,
                errorMessage: "El sueldo debe estar entre 50 y 3000."
            }
        },
        movilidad: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo de movilidad!"
        },
        cantAdultos: {
            in: ["body"],
            isNumeric: true,
            notEmpty: true,
            custom: {
                options: (value) => Number(value) >= 1,
                errorMessage: "El campo de cantidad de adultos debe ser un número mayor o igual a 1."
            },
            errorMessage: "Error en el campo de cantidad de adultos, debe ser un valor numérico!"
        },
        cantNiños: {
            in: ["body"],
            isNumeric: true,
            notEmpty: true,
            errorMessage: "Error en el campo de detalle de domicilio(cantidad niños), debe ser valores numericos!"
        },
        mascotas: {
            in: ['body'],
            isBoolean: true,
            notEmpty: true,
            errorMessage: "Error en el campo de detalle de domicilio(mascotas), debe ser si/no!",
        },
        cantPisos: {
            in: ["body"],
            isNumeric: true,
            custom: {
                options: (value) => Number(value) >= 1,
                errorMessage: "El campo de cantidad de pisos debe ser un número mayor o igual a 1."
            },
            notEmpty: true,
            errorMessage: "Error en el campo de detalle de domicilio(cantidad de pisos), debe ser valores numericos!"
        },
        observaciones: {
            in: ['body'],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo de observaciones!"
        },
        estado: {
            in: ['body'],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo del estado!"
        },
        ordenDeServicio: {
            in: ["body"],
            isBoolean: true,
            notEmpty: true,
            errorMessage: "Error en el campo de orden de servicio!"
        },
        //* FALTA CHECAR LO DE ORDEN DE SERVICIO!
    }),
    validateReq,
    async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            let { lunes, martes, miercoles, jueves, viernes, sabado, domingo, funciones, dniEmpleador, direccion, referenciaDeDomicilio, modalidad, puesto, id, ...rest } = req.body;
            const daysOfWeek = [lunes, martes, miercoles, jueves, viernes, sabado, domingo];
            daysOfWeek.forEach((day, index) => daysOfWeek[index] = [new Date(day[0]).toISOString(), new Date(day[1]).toISOString()].join(","));

            lunes = daysOfWeek[0];
            martes = daysOfWeek[1];
            miercoles = daysOfWeek[2];
            jueves = daysOfWeek[3];
            viernes = daysOfWeek[4];
            sabado = daysOfWeek[5];
            domingo = daysOfWeek[6];


            const newArray: string[] = [lunes, martes, miercoles, jueves, viernes, sabado, domingo];

            let atleastOneDifferent = false;

            newArray.forEach((day: string) => {
                const dates: string[] = day.split(",");
                const firstTime: Date = new Date(dates[0]);
                const secondTime: Date = new Date(dates[1]);
            
                if (firstTime > secondTime) {
                    return res.status(403).send({ message: "Ha ingresado una hora de ingreso mayor o igual a la hora de salida!" });
                }
            
                if (firstTime.getHours() !== secondTime.getHours() || firstTime.getMinutes() !== secondTime.getMinutes()) {
                    atleastOneDifferent = true;
                }
            });
            
            if (!atleastOneDifferent) 
                return res.status(403).send({ message: "Ha introducido un horario con todas las horas iguales, verificar la información!" });
            

            const { ...nuevoHorario } = { lunes: lunes, martes: martes, miercoles: miercoles, jueves: jueves, viernes: viernes, sabado: sabado, domingo: domingo };

            const employeerAlreadyExists = await appDataSource.getRepository("empleador").findOne({ where: { persona: { dni: dniEmpleador } } });
            if (!employeerAlreadyExists) return res.status(403).send({ message: "El empleador no existe!" });

            const modalidadTemp = await appDataSource.getRepository("modalidad").findOne({ where: { descripcion: modalidad } });
            if (!modalidadTemp) return res.status(403).send({ message: "La modalidad no existe en la base de datos!" });

            const usuario = await appDataSource.getRepository("usuario").findOne({ where: { id: req.params.idUser} });
            if (!usuario) return res.status(403).send({ message: "Ocurrio un error con el usuario!" });

            const puestoTemp = await appDataSource.getRepository("puesto").findOne({ where: { descripcion: puesto } });
            if (!puestoTemp) return res.status(403).send({ message: "El puesto no existe en la base de datos!" });
            const createdHorario: IHorario = <IHorario>(<unknown>{ ...nuevoHorario });

            const horario = await appDataSource.getRepository("horario_pedido").save(createdHorario);


            const { ...nuevoPedido } = { ...rest, horarioPedido: horario, modalidad: modalidadTemp, puesto: puestoTemp, empleador: employeerAlreadyExists, eliminado: false };
            const newPedidoCreated: any = <IPedido>(<unknown>{ ...nuevoPedido });
            newPedidoCreated["fechaRegistro"] = new Date();
            const pedido = await appDataSource.getRepository("pedido").save({ ...newPedidoCreated, usuario });

            for (const data of (funciones as Array<string>)) {
                // console.log(data);
                const funcion = await appDataSource.getRepository("funciones").findOne({ where: { descripcion: data } });
                await appDataSource.getRepository("funciones_pedido").save({ funcion: funcion, pedido });
            };

            await appDataSource.getRepository("historial_usuario").save({
                usuario: req.params.idUser,
                seccion: "RECLUTAMIENTO",
                modulo: "PEDIDOS",
                descripcion: `REGISTRO UN PEDIDO CON EL DNI: ${dniEmpleador} E ID: ${pedido.id}`,
                accion: "REGISTRAR",
                fecha: new Date()
            });

            return res.send({ message: "Se ha creado correctamente el pedido!" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.put("/pedidos/editar/:id",
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true }),
    checkSchema({
        modalidad: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de modalidad!",
        },
        horasSemanales: {
            in: ["body"],
            isNumeric: true,
            notEmpty: true,
            errorMessage: "Error en el campo de las horas diarias!!"
        },
        puesto: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de puesto!",
        },
        edadMinima: {
            in: ["body"],
            isNumeric: {
                errorMessage: "La edad mínima debe ser un número entero."
            },
            notEmpty: {
                errorMessage: "El campo de la edad mínima no puede estar vacío."
            },
            custom: {
                options: (value) => value >= 18 && value <= 55,
                errorMessage: "La edad mínima debe estar entre 18 y 55."
            }
        },
        edadMaxima: {
            in: ["body"],
            isNumeric: {
                errorMessage: "La edad máxima debe ser un número entero."
            },
            notEmpty: {
                errorMessage: "El campo de la edad máxima no puede estar vacío."
            },
            custom: {
                options: (value) => value >= 18 && value <= 55,
                errorMessage: "La edad máxima debe estar entre 18 y 55."
            }
        },
        fechaInicio: {
            in: "body",
            notEmpty: { errorMessage: "El campo fecha de inicio no puede estar vacio!" },
            // isDate: { errorMessage: "El campo fecha de inicio no tiene un formato valido!!" },
            isISO8601: { errorMessage: "El campo fecha de inicio tiene que ser de formato ISO8601!" },
            toDate: true,
            errorMessage: "La fecha de inicio tiene datos incorrectos!."
        },
        movilidad: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo de movilidad!"
        },
        funciones: {
            in: ["body"],
            notEmpty: true,
            isArray: true,
            custom: {
                options: (value) => Array.isArray(value) && value.length > 0,
                errorMessage: "El campo funciones no debe estar vacío!"
            },
            errorMessage: "Error en el campo de funciones!"
        },
        rutina: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de rutina!"
        },
        sueldo: {
            in: ["body"],
            isNumeric: {
                errorMessage: "El sueldo debe ser numerico!!."
            },
            notEmpty: {
                errorMessage: "El campo sueldo no puede estar vacío."
            },
            custom: {
                options: (value) => value >= 50 && value <= 3000,
                errorMessage: "El sueldo debe estar entre 50 y 3000."
            }
        },
        cantAdultos: {
            in: ["body"],
            isNumeric: true,
            notEmpty: true,
            custom: {
                options: (value) => Number(value) >= 1,
                errorMessage: "El campo de cantidad de adultos debe ser un número mayor o igual a 1."
            },
            errorMessage: "Error en el campo de cantidad de adultos, debe ser un valor numérico!"
        },
        cantNiños: {
            in: ["body"],
            isNumeric: true,
            notEmpty: true,
            errorMessage: "Error en el campo de detalle de domicilio(cantidad niños), debe ser valores numericos!"
        },
        mascotas: {
            in: ['body'],
            isBoolean: true,
            notEmpty: true,
            errorMessage: "Error en el campo de detalle de domicilio(mascotas), debe ser si/no!",
        },
        cantPisos: {
            in: ["body"],
            isNumeric: true,
            custom: {
                options: (value) => Number(value) >= 1,
                errorMessage: "El campo de cantidad de pisos debe ser un número mayor o igual a 1."
            },
            notEmpty: true,
            errorMessage: "Error en el campo de detalle de domicilio(cantidad de pisos), debe ser valores numericos!"
        },
        observaciones: {
            in: ['body'],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo de observaciones!"
        },
        lunes: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Lunes!"
        },
        martes: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Martes!"
        },
        miercoles: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Miercoles!"
        },
        jueves: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Jueves!"
        },
        viernes: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Viernes!"
        },
        sabado: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Sabado!"
        },
        domingo: {
            in: ["body"],
            optional: true,
            isArray: true,
            errorMessage: "Error en la asignacion de horas del dia Domingo!"
        },
        estado: {
            in: ['body'],
            isString: true,
            notEmpty: true,
            errorMessage: "Error en el campo del estado!"
        },
        tipoDomicilio: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de tipo de domicilio!",
        },
        estadoPedido: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de estado del pedido!",
        },
        tipoEntrevista: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de tipo de entrevista!",
        },
        ordenDeServicio: {
            in: ["body"],
            isBoolean: true,
            notEmpty: true,
            errorMessage: "Error en el campo de orden de servicio!"
        },
        periocidad: {
            in: ["body"],
            notEmpty: true,
            isString: true,
            errorMessage: "Error en el campo de tipo de periocidad!",
        }
    }),
    validateReq,
    validationToken,
    async (req: Request, res: Response) => {
        try {
            let { lunes, martes, miercoles, jueves, viernes, sabado, domingo, funciones, modalidad, puesto, ...rest } = req.body;
            const modalidadTemp = await appDataSource.getRepository("modalidad").findOne({ where: { descripcion: modalidad } });
            if (!modalidadTemp) return res.status(403).send({ message: "La modalidad no existe en la base de datos!" });

            const puestoTemp = await appDataSource.getRepository("puesto").findOne({ where: { descripcion: puesto } });
            if (!puestoTemp) return res.status(403).send({ message: "El puesto no existe en la base de datos!" });
            const pedido = await appDataSource.getRepository("pedido").findOne({ where: { id: req.params.id }, relations: ["horarioPedido"] });
            const { ...newDataToUpdate } = rest;
            const dataUpdated: IUPedido = <IUPedido>(<unknown>{ ...newDataToUpdate, modalidad: modalidadTemp, puesto: puestoTemp });

            await appDataSource.getRepository("funciones_pedido").delete({ pedido: { id: req.params.id } });

            for (const data of (funciones as Array<string>)) {
                const funcion = await appDataSource.getRepository("funciones").findOne({ where: { descripcion: data } });
                await appDataSource.getRepository("funciones_pedido").save({ funcion: funcion, pedido });
            };

            // await appDataSource.getRepository("horario_pedido").delete({ id: pedido!.horarioPedido.id });
            const daysOfWeek = [lunes, martes, miercoles, jueves, viernes, sabado, domingo];
            daysOfWeek.forEach((day, index) => daysOfWeek[index] = [new Date(day[0]).toISOString(), new Date(day[1]).toISOString()].join(","));

            lunes = daysOfWeek[0];
            martes = daysOfWeek[1];
            miercoles = daysOfWeek[2];
            jueves = daysOfWeek[3];
            viernes = daysOfWeek[4];
            sabado = daysOfWeek[5];
            domingo = daysOfWeek[6];

            const { ...nuevoHorario } = { lunes: lunes, martes: martes, miercoles: miercoles, jueves: jueves, viernes: viernes, sabado: sabado, domingo: domingo };
            const createdHorario: IHorario = <IHorario>(<unknown>{ ...nuevoHorario });
            // console.log(pedido!.horarioPedido);
            await appDataSource.getRepository("horario_pedido").update({ id: pedido!.horarioPedido.id }, { ...createdHorario });

            await appDataSource.getRepository("pedido").update({ id: req.params.id }, { ...dataUpdated });

            return res.send({ message: "El pedido se actulizo correctamente!" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.get("/pedidos/get_all/",
    async (req: Request, res: Response) => {
        try {
            const data = await appDataSource.getRepository("pedido").find({ relations: ["empleador", "modalidad", "puesto", "horarioPedido", "funcionesPedido", "funcionesPedido.funcion", "empleador.persona"], where: { eliminado: false }, order: { id: "DESC" } });
            data.forEach((pedido: any) => {
                pedido["modalidad"] = pedido["modalidad"].descripcion;
                pedido["puesto"] = pedido["puesto"].descripcion;
                pedido["funcionesPedido"] = pedido["funcionesPedido"].map((funcion: ObjectLiteral) => funcion.funcion.descripcion);
            });
            return res.send(data);
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

//TODO MODALIDAD, PUESTO, PASAJE, SUELDO, EST. PEDIDO, ESTADO, HORARIO
router.post("/pedidos/get_by_dni/:dni",
    param("dni")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("El id debe ser numerico!"),
    async (req: Request, res: Response) => {
        try {
            let pedidos = await appDataSource.getRepository("pedido").find({ where: { empleador: { persona: { dni: req.params.dni } }, eliminado: false }, relations: ["horarioPedido", "modalidad", "puesto"] });
            if (pedidos.length === 0) return res.status(403).send({ message: "No se han encontrado pedidos para este empleador!" });

            pedidos = pedidos.map((pedido: ObjectLiteral) => {
                delete pedido["horarioPedido"]["id"];

                return {
                    id: pedido.id,
                    modalidad: pedido.modalidad.descripcion,
                    puesto: pedido.puesto.descripcion,
                    movilidad: pedido.movilidad,
                    fechaInicio: pedido.fechaInicio,
                    sueldo: pedido.sueldo,
                    periocidad: pedido.periocidad ?? "NO ESPECIFICADO",
                    estadoPedido: pedido.estadoPedido ?? "NO ESPECIFICADO",
                    estado: pedido.estado,
                    // horarioPedido: pedido.horarioPedido
                }
            });

            return res.send(pedidos)
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
)

// router.post("/pedidos/get_by_dni/:dni/",
//     param("dni")
//         .notEmpty()
//         .isNumeric({ no_symbols: true }),
//     async (req: Request, res: Response) => {
//         try {
//             const data = await appDataSource.getRepository("pedido").find({ where: { empleador: { persona: { dni: req.params.dni } } } });
//             if (data.length === 0) return res.status(403).send({ message: "No se han encontrado pedidos para este empleador!" });
            
//             return data;
//         } catch (error) {
//             return res.status(500).send({ message: "Error en el servidor!" });
//         }
//     }
// );

router.delete("/pedidos/eliminar/:id/:idUser",
    param("idUser")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id de usuario"),
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el parametro id!"),
    async (req: Request, res: Response) => {
        try {
            const pedido = await appDataSource.getRepository("pedido").findOne({ where: { id: req.params["id"] }, relations: ["empleador", "empleador.persona"] });
            if (!pedido) return res.status(403).send({ message: "El pedido no se ha encontrado!!" });
            await appDataSource.getRepository("pedido").update({ id: req.params["id"] }, { eliminado: true });

            await appDataSource.getRepository("historial_usuario").save({
                usuario: req.params.idUser,
                seccion: "RECLUTAMIENTO",
                modulo: "PEDIDOS",
                descripcion: `ELIMINO A UN PEDIDO CON EL DNI: ${pedido.empleador.persona.dni} E ID: ${pedido.id}`,
                accion: "ELIMINAR",
                fecha: new Date()
            });
            return res.send({ message: "El pedido se ha eliminado!" });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.post("/pedidos/get-candidatos/:id",
    param("id")
        .optional()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el campo ID!"),
    checkSchema({
        puesto: {
            in: ["body"],
            optional: true,
            isString: true,
        },
        edadMinima: {
            in: ["body"],
            optional: true,
            isNumeric: true,
        },
        edadMaxima: {
            in: ["body"],
            optional: true,
            isNumeric: true,
        },
    }),
    async (req: Request, res: Response) => {
        try {
            //* TERMINOS DE BUSQUEDA: MODALIDAD, PUESTOS, FUNCIONES, EDAD rango
            let pedido: any;
            if (req.params["id"] === "undefined") {
                // const modalidad = await appDataSource.getRepository("modalidad").findOne({ where: { descripcion: req.body.modalidad } })
                const puesto = await appDataSource.getRepository("puesto").findOne({ where: { descripcion: req.body.puesto } });
                const { edadMinima, edadMaxima } = req.body;
                pedido = {
                    edadMaxima,
                    edadMinima,
                    // modalidad,
                    puesto
                }
            } else {
                pedido = await appDataSource.getRepository("pedido").findOne({ where: { id: req.params["id"] }, relations: ["puesto"] });
            }
            
            if (!req.body["puesto"] || !req.body["edadMinima"] || !req.body["edadMaxima"]) return res.status(403).send({ message: "Complete los campos de busqueda!" });
            const { puesto, edadMaxima, edadMinima } = pedido;

            const trabajadores = await appDataSource.getRepository("trabajador").find({
                where: { 
                    puestoTrabajador: { puesto: puesto }, 
                    // modalidadTrabajador: { modalidad: modalidad }, 
                    edad: Between(edadMinima, edadMaxima), 
                    eliminado: false, 
                    ubicacionArchivo: { descripcion: In(["APTA", "APTO CONDICIONAL", "LABORANDO POR SU CUENTA"]) }
                },
                relations: [
                    "puestoTrabajador", 
                    "modalidadTrabajador", 
                    "puestoTrabajador.puesto", 
                    "modalidadTrabajador.modalidad", 
                    "cita", 
                    "cita.persona", 
                    "folder", 
                    "ubicacionArchivo"
                ]
            });

            const convenios = await appDataSource.getRepository("convenio").find({
                where: { estado: "COLOCACION", resultado: "EXITOSO" },
                relations: ["trabajador"]
            });

            console.log(trabajadores);

            const idTrabajadoresColocados = convenios.map((convenio: ObjectLiteral) => convenio.trabajador.id);

            const dataTrabajadores = trabajadores.filter((trabajador: ObjectLiteral) => !idTrabajadoresColocados.includes(trabajador.id)).map((trabajador: ObjectLiteral) => ({
                id: trabajador.id,
                foto: trabajador.fotoTrabajador,
                dni: trabajador.cita.persona.dni,
                nombres: trabajador.cita.persona.nombres,
                "ubicacion Archivo": trabajador.ubicacionArchivo.descripcion,
                folder: trabajador.folder.descripcion,
                celular: trabajador.cita.persona.telefono,
                apellidos: `${trabajador.cita.persona.apellidoPaterno} ${trabajador.cita.persona.apellidoMaterno}`,
                codigo: trabajador.codigoTrabajador,
                evaluacionPsicologica: trabajador.evaluacionPsicologica,
                edad: trabajador.edad
            }));

            if (dataTrabajadores.length === 0) return res.status(403).send({ message: "No se encontraron candidatos" });

            return res.send(dataTrabajadores);
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.get("/pedido/generar_pdf/:id",
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("Error en el id!"),
    validateReq,
    // validationToken,
    async (req: Request, res: Response) => {
        try {
            const pedido = await appDataSource.getRepository("pedido").findOne({
                where: { id: req.params.id }, relations: [
                    "horarioPedido",
                    "empleador",
                    "empleador.persona",
                    "puesto",
                    "funcionesPedido",
                    "funcionesPedido.funcion"
                ]
            });

            const pdf = await generatePdf(pedido, "../extras/pedido.ejs");

            res.contentType("application/pdf");
            res.setHeader("Content-Disposition", `inline; filename=Pedido_${pedido!.empleador.persona.nombres} ${pedido!.empleador.persona.apellidoPaterno} ${pedido!.empleador.persona.apellidoMaterno}_${req.params.id}.pdf`);
            return res.send(pdf);
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.get("/pedido/get-count/",
    async (req: Request, res: Response) => {
        try {
            const count = await appDataSource.getRepository("pedido").count({ where: { eliminado: false } });
            return res.send({ count });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

//TODO DESPUES TERMINAR LA MODIFICACION DE PEDIDOS Y PONER EL HISTORIAL EN EL

router.post("/pedido/get-link/",
    checkSchema({
        arrayId: {
            in: ["body"],
            notEmpty: true,
            isArray: { errorMessage: "Ocurrio un error en las id's" },
            errorMessage: "Error en el campo id"
        }
    }),
    validateReq,
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const { arrayId } = req.body;
            console.log(arrayId);

            const tokenTemp: string = await jwt.sign({
                workers: arrayId
            }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "1hr" });

            return res.send({ token: tokenTemp });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

export default router;