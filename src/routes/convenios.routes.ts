import { Router, Request, Response } from "express";
import { checkSchema, param } from "express-validator";
import { validateReq } from "../middlewares/validateRequest";
import { appDataSource } from "../dataBase";
import { Between, Equal, Not, ObjectLiteral } from "typeorm";
import fs from "fs";
import { IConvenio } from "../interfaces/convenio";
import { describe } from "node:test";
import { Funciones } from "../entities/funciones";
import { validationToken } from "../middlewares/token";
import { generatePdf } from "../scripts/generatePdf";
import path from "node:path";
import { agruparDiasPorHoras } from "../scripts/convertirHorarioATexto";

const router = Router();

router.post(
  "/convenios/register/:idUser",
  param("idUser")
    .notEmpty()
    .isNumeric({ no_symbols: true })
    .withMessage("Error en el id de usuario"),
  checkSchema({
    dniTrabajador: {
      in: ["body"],
      isNumeric: true,
      isLength: {
        options: { max: 8, min: 8 },
        errorMessage: "El dni debe ser de 8 digitos.",
      },
      notEmpty: true,
      errorMessage: "Los datos de dni son incorrectos.",
    },
    dniEmpleador: {
      in: ["body"],
      isNumeric: true,
      isLength: {
        options: { max: 8, min: 8 },
        errorMessage: "El dni debe ser de 8 digitos.",
      },
      notEmpty: true,
      errorMessage: "Los datos de dni son incorrectos.",
    },
    fechaFinal: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "La fecha final es obligatoria.",
    },
    observacion: {
      in: ["body"],
      optional: true,
      isString: true,
      errorMessage: "Ocurrio un error en el campo de observaciones!"
    },
    fechaConvenio: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "Los datos de la fecha de convenio son invalidos!",
    },
    fechaInicio: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "Los datos de la fecha de inicio son invalidos!",
    },
    fechaFin: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "Los datos de la fecha de fin son invalidos!",
    },
    sueldo: {
      in: ["body"],
      isNumeric: true,
      notEmpty: true,
      errorMessage: "El sueldo ingresado es invalido.",
    },
    puesto: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "No se seleccionó ningún puesto.",
    },
    funciones: {
      in: ["body"],
      isArray: true,
      notEmpty: true,
      errorMessage: "No se seleccionó ninguna función.",
    },
    funcionesOtros: {
      in: ["body"],
      isString: true,
      optional: true,
      errorMessage: "No se seleccionó ninguna otra función.",
    },
    estado: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "No se seleccionó ningún estado.",
    },
    motivoEstado: {
      in: ["body"],
      isString: true,
      optional: true,
      errorMessage: "Ocurrio un error en el campo de estado - reemplazo1",
    },
    resultado: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "No se seleccionó ningún resultado.",
    },
    motivoAnuladoResultado: {
      in: ["body"],
      isString: true,
      optional: true,
      errorMessage: "Ocurrio un error en el campo de resultado - Anulado!",
    },
    estadoConvenio: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "Ocurrió un error con el estado del convenio",
    },
    entrevistaId: {
      in: ["body"],
      notEmpty: true,
      errorMessage: "Elija un entrevista para relacionarlo con el convenio!"
    }
  }),
  validateReq,
  async (req: Request, res: Response) => {
    try {
      const { dniTrabajador, dniEmpleador, funciones, puesto, entrevistaId, ...data } =
        req.body;
      let entrevista;

      if (entrevistaId) {
        entrevista = await appDataSource.getRepository("entrevista").findOne({ where: { id: req.body.entrevistaId }, relations: ["convenio", "pedido"] });
        if (!entrevista) return res.status(403).send({ message: "El pedido no se encontro en la base de datos!" });
        if (entrevista.convenio) return res.status(403).send({ message: "La entrevista ya tiene un convenio registrado!" });
      }
      // console.log(pedido);

      const trabajadorExiste = await appDataSource
        .getRepository("trabajador")
        .findOne({
          where: {
            cita: {
              persona: {
                dni: dniTrabajador,
              },
            },
          },
        });
      if (!trabajadorExiste)
        return res.status(403).send({
          message: "El trabajador no existe!",
        });

      const empleadorExiste = await appDataSource
        .getRepository("empleador")
        .findOne({
          where: {
            persona: {
              dni: dniEmpleador,
            },
          },
        });
      if (!empleadorExiste)
        return res.status(403).send({
          message: "El empleador no existe!",
        });

      const convenio = await appDataSource.getRepository("convenio").findOne({
        where: [
          {
            trabajador: trabajadorExiste,
            fechaConvenio: Equal(req.body["fechaConvenio"]),
            estadoConvenio: Not("GARANTIA FINALIZADA"),
          },
          {
            empleador: empleadorExiste,
            fechaConvenio: Equal(req.body["fechaConvenio"]),
            estadoConvenio: Not("GARANTIA FINALIZADA"),
          },
        ],
      });

      if (convenio)
        return res.status(401).send({
          message:
            "El empleador o trabajador ya tiene un convenio en dicha fecha!.",
        });

      const usuario = await appDataSource.getRepository("usuario").findOne({ where: { id: req.params.idUser } });
      if (!usuario) return res.status(403).send({ message: "Ocurrio un error con el usuario!" });

      const puestoTemp = await appDataSource.getRepository("puesto").findOne({
        where: {
          descripcion: puesto,
        },
      });

      const { ...newConvenio } = {
        trabajador: trabajadorExiste,
        empleador: empleadorExiste,
        puesto: puestoTemp,
        entrevista,
        ...data,
      };

      const createdConvenio: IConvenio = <IConvenio>(
        (<unknown>{ ...newConvenio })
      );
      
      // console.log("llego hasta aca");

      const entrevistaAlreadyInUse = await appDataSource.getRepository("convenio").findOne({ where: { entrevista: { id: entrevista!.id } } });
      if (entrevistaAlreadyInUse) return res.status(403).send({ message: "La entrevista ya tiene un convenio asignado!" });

      const convenioTemp = await appDataSource
        .getRepository("convenio")
        .save({ ...createdConvenio, usuario });

        // console.log("llego hasta aca");

      for (const data of funciones) {
        const funcion = await appDataSource
          .getRepository("funciones")
          .findOne({ where: { descripcion: data } });
        await appDataSource
          .getRepository("funciones_convenio")
          .save({ funcion: funcion, convenio: convenioTemp });
      }

      await appDataSource.getRepository("historial_usuario").save({
        usuario: req.params.idUser,
        seccion: "RECLUTAMIENTO",
        modulo: "CONVENIOS",
        descripcion: `REGISTRO UN NUEVO CONVENIO CON EL DNI EMPLEADOR: ${dniEmpleador} E ID: ${convenioTemp.id}`,
        accion: "REGISTRAR",
        fecha: new Date()
      });

      if (convenioTemp.resultado === "EXITOSO" && (convenioTemp.estado !== "ANULADO" && entrevista)) {
        await appDataSource.getRepository("entrevista").update({ id: entrevista.id }, { estado: "Exitosa" });
        await appDataSource.getRepository("pedido").update({ id: entrevista.pedido.id }, { estado: "Exitoso" });
      }

      if (convenioTemp.resultado === "EXITOSO" && convenioTemp.estado === "COLOCACION") {
        const ubicacionArchivo = await appDataSource.getRepository("ubicacion_archivo").findOne({ where: { descripcion: "COLOCADO" } });
        await appDataSource.getRepository("trabajador").update({ id: trabajadorExiste.id }, { ubicacionArchivo });
      }

      return res.send({ message: "Se ha creado correctamente el convenio!" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error });
    }
  }
);

router.get("/convenios/get_all/", async (req: Request, res: Response) => {
  try {
    const data = await appDataSource.getRepository("convenio").find({
      relations: [
        "empleador",
        "trabajador",
        "funcionesConvenio.funcion",
        "empleador.persona",
        "trabajador.cita",
        "trabajador.cita.persona",
        "puesto",
        "entrevista",
        "entrevista.pedido",
        "entrevista.pedido.horarioPedido"
      ],
    });
    return res.send(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error en el servidor!" });
  }
});

router.put(
  "/convenios/update/:id/:idUser",
  param("idUser")
    .notEmpty()
    .isNumeric({ no_symbols: true })
    .withMessage("Error en el id de usuario"),
  param("id")
    .isNumeric({ no_symbols: true })
    .withMessage("El ID del convenio debe ser un número."),
  checkSchema({
    dniTrabajador: {
      in: ["body"],
      isNumeric: true,
      isLength: {
        options: { max: 8, min: 8 },
        errorMessage: "El DNI debe ser de 8 dígitos.",
      },
      notEmpty: true,
      errorMessage: "El DNI del trabajador es obligatorio.",
    },
    observacion: {
      in: ["body"],
      optional: true,
      isString: true,
      errorMessage: "Ocurrio un error en el campo de observaciones!"
    },

    dniEmpleador: {
      in: ["body"],
      isNumeric: true,
      isLength: {
        options: { max: 8, min: 8 },
        errorMessage: "El DNI debe ser de 8 dígitos.",
      },
      notEmpty: true,
      errorMessage: "El DNI del empleador es obligatorio.",
    },
    entrevistaId: {
      in: ["body"],
      notEmpty: true,
      errorMessage: "Elija una entrevista para relacionarlo con el convenio!"
    },
    fechaConvenio: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "La fecha del convenio es obligatoria.",
    },
    fechaInicio: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "La fecha de inicio es obligatoria.",
    },
    fechaFin: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "La fecha de fin es obligatoria.",
    },
    fechaFinal: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "La fecha final es obligatoria.",
    },
    sueldo: {
      in: ["body"],
      isNumeric: true,
      notEmpty: true,
      errorMessage: "El sueldo es obligatorio.",
    },
    puesto: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "El puesto es obligatorio.",
    },
    funciones: {
      in: ["body"],
      isArray: true,
      notEmpty: true,
      errorMessage: "No se seleccionó ninguna función.",
    },
    funcionesOtros: {
      in: ["body"],
      isString: true,
      optional: true,
      errorMessage: "No se seleccionó ninguna otra función.",
    },
    estado: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "No se seleccionó ningún estado.",
    },
    motivoEstado: {
      in: ["body"],
      isString: true,
      optional: true,
      errorMessage: "Ocurrio un error en el campo de motivo estado",
    },
    resultado: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "No se seleccionó ningún resultado.",
    },
    motivoAnuladoResultado: {
      in: ["body"],
      isString: true,
      optional: true,
      errorMessage: "Ocurrio un error en el campo de resultado - Anulado!",
    },
    estadoConvenio: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "El estado del convenio es obligatorio.",
    },
  }),
  validateReq,
  validationToken,
  async (req: Request, res: Response) => {
    try {
      const convenioId = parseInt(req.params["id"]);

      // Verificar si el convenio existe
      const convenioExistente = await appDataSource
        .getRepository("convenio")
        .findOne({
          where: { id: convenioId },
          relations: ["trabajador", "empleador", "puesto", "funcionesConvenio"],
        });
      if (!convenioExistente) {
        return res.status(404).send({ message: "Convenio no encontrado." });
      }

      let entrevista;
      if (req.body["entrevistaId"]) {
        entrevista = await appDataSource.getRepository("entrevista").findOne({ where: { id: req.body.entrevistaId } });
        if (!entrevista) return res.status(403).send({ message: "El entrevista no se encontro en la base de datos!" });

      }


      delete req.body["entrevistaId"];

      // Verificar existencia del trabajador y empleador
      const trabajador = await appDataSource
        .getRepository("trabajador")
        .findOne({
          where: { cita: { persona: { dni: req.body.dniTrabajador } } },
        });
      if (!trabajador) {
        return res.status(404).send({ message: "Trabajador no encontrado." });
      }

      const empleador = await appDataSource.getRepository("empleador").findOne({
        where: { persona: { dni: req.body.dniEmpleador } },
      });
      if (!empleador) {
        return res.status(404).send({ message: "Empleador no encontrado." });
      }

      console.log(req.body.fechaFin);

      // Actualizar el convenio
      await appDataSource.getRepository("convenio").update(convenioId, {
        trabajador,
        empleador,
        fechaConvenio: req.body.fechaConvenio,
        fechaInicio: req.body.fechaInicio,
        fechaFinal: req.body.fechaFinal,
        fechaFin: req.body.fechaFin,
        sueldo: req.body.sueldo,
        puesto: await appDataSource
          .getRepository("puesto")
          .findOne({ where: { descripcion: req.body.puesto } }),
        estado: req.body.estado,
        motivoEstado: req.body.motivoEstado,
        resultado: req.body.resultado,
        observacion: req.body.observacion,
        motivoAnuladoResultado: req.body.motivoAnuladoResultado,
        estadoConvenio: req.body.estadoConvenio,
        funcionesOtros: req.body.funcionesOtros,
        entrevista
      });

      // Eliminar las funciones existentes relacionadas con este convenio
      await appDataSource
        .getRepository("funciones_convenio")
        .delete({ convenio: { id: convenioId } });

      // Agregar nuevas funciones asociadas al convenio
      for (const funcionDescripcion of req.body.funciones) {
        const funcion = await appDataSource
          .getRepository("funciones")
          .findOne({ where: { descripcion: funcionDescripcion } });
        if (funcion) {
          await appDataSource
            .getRepository("funciones_convenio")
            .save({ funcion, convenio: convenioExistente });
        }
      }

      await appDataSource.getRepository("historial_usuario").save({
        usuario: req.params.idUser,
        seccion: "RECLUTAMIENTO",
        modulo: "CONVENIOS",
        descripcion: `MODIFICO UN CONVENIO CON EL DNI EMPLEADOR: ${req.body.dniEmpleador} E ID: ${convenioId}`,
        accion: "MODIFICAR",
        fecha: new Date()
      });
      res.send({ message: "Convenio actualizado correctamente." });
    } catch (error) {
      console.error("Error al actualizar el convenio:", error);
      res
        .status(500)
        .send({ message: "Error en el servidor al actualizar el convenio." });
    }
  }
);

router.delete(
  "/convenios/delete/:id/:idUser",
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
      const convenioId = parseInt(req.params["id"]);
      const convenio = await appDataSource.getRepository("convenio").findOne({ where: { id: convenioId }, relations: ["empleador", "empleador.persona", "entrevista", "entrevista.pedido"] })
      if (!convenio) return res.status(403).send({ message: "El convenio no existe!" });
      await appDataSource
        .getRepository("funciones_convenio")
        .delete({ convenio: { id: req.params["id"] } });

      await appDataSource
        .getRepository("convenio")
        .delete({ id: req.params["id"] });

      await appDataSource.getRepository("historial_usuario").save({
        usuario: req.params.idUser,
        seccion: "RECLUTAMIENTO",
        modulo: "CONVENIOS",
        descripcion: `ELIMINO UN CONVENIO CON EL DNI EMPLEADOR: ${convenio.empleador.persona.dni} E ID: ${convenioId}`,
        accion: "ELIMINAR",
        fecha: new Date()
      });

      await appDataSource.getRepository("entrevista").update({ id: convenio.entrevista.id }, { estado: "Pendiente" });
      await appDataSource.getRepository("pedido").update({ id: convenio.entrevista.pedido.id }, { estado: "Pendiente" });

      return res.send({
        message:
          "Se ha eliminado correctamente el convenio y sus registros relacionados!",
      });
    } catch (error) {
      console.error("Error al intentar eliminar el convenio:", error);
      return res.status(500).send({ message: "Error en el servidor!" });
    }
  }
);

router.get("/convenios/generate-pdf/:id/:tipo",
  param("id")
    .notEmpty()
    .isNumeric({ no_symbols: true }),
  param("tipo")
    .notEmpty()
    .isString(),
    validateReq,
  async (req: Request, res: Response) => {
    try {
      const convenio = await appDataSource.getRepository("convenio").findOne({
        where: { id: req.params.id }, relations: [
          "empleador", "empleador.persona", "trabajador", "trabajador.modalidadTrabajador", "trabajador.modalidadTrabajador.modalidad","trabajador.cita", "trabajador.cita.persona",
          "entrevista", "entrevista.pedido", "entrevista.pedido.horarioPedido", "funcionesConvenio", "funcionesConvenio.funcion", "puesto"
        ]
      });

      if (!convenio) return res.status(403).send({ message: "Ocurrio un error al encontrar el convenio!" });

      const {
        fechaConvenio, fechaInicio, fechaFin, fechaFinal, sueldo, observacion, estado, resultado,
        estadoConvenio,
        empleador, trabajador, entrevista, funcionesConvenio, puesto, id
      } = convenio;

      const formatoPeruFechaConvenio= new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(fechaConvenio);

      const formatoPeruFechaInicio= new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(fechaInicio);

      const formatoPeruFechaFin= new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(fechaFin);

      const { pedido } = entrevista;

      const funciones = funcionesConvenio.map((funcion: ObjectLiteral) => funcion.funcion.descripcion);

      const imageBuffer = fs.readFileSync(path.join(__dirname, "../assets/logo-nanas-amas.png"));
      const base64Image = imageBuffer.toString("base64");
      const dataUri = `data:image/png;base64,${base64Image}`;
      const formatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

      const imageBufferFirma = fs.readFileSync(path.join(__dirname, "../assets/firma.png"));
      const base64ImageFirma = imageBufferFirma.toString("base64");
      const dataUriFirma = `data:image/png;base64,${base64ImageFirma}`;
      console.log(trabajador);

      const data = {
        id,
        logo: dataUri,
        firma: dataUriFirma,
        fechaConvenio: formatoPeruFechaConvenio,
        fechaInicio: formatoPeruFechaInicio,
        fechaFin: formatoPeruFechaFin,
        fechaFinal,
        sueldo: formatter.format(sueldo),
        estadoConvenio,
        observacion,
        estado,
        // modalidad: convenio.modalidad,
        periocidad: pedido.periocidad ?? "No especificado...",
        resultado,
        funciones,
        puesto: puesto.descripcion,
        horario: agruparDiasPorHoras({
          lunes: pedido.horarioPedido.lunes,
          martes: pedido.horarioPedido.martes,
          miercoles: pedido.horarioPedido.miercoles,
          jueves: pedido.horarioPedido.jueves,
          viernes: pedido.horarioPedido.viernes,
          sabado: pedido.horarioPedido.sabado,
        }),
        empleador: {
          dni: empleador.persona.dni,
          nombres: empleador.persona.nombres,
          apellidoPaterno: empleador.persona.apellidoPaterno,
          apellidoMaterno: empleador.persona.apellidoMaterno,
          telefono: empleador.persona.telefono,
          direccion: empleador.persona.direccion,
        },
        trabajador: {
          dni: trabajador.cita.persona.dni,
          modalidad: trabajador.modalidadTrabajador.modalidad?.descripcion ?? "No especificado...",
          distrito: trabajador.cita.persona.distritoDomicilio,
          provincia: trabajador.cita.persona.provinciaDomicilio,
          departamento: trabajador.cita.persona.departamentoDomicilio,
          direccion: trabajador.cita.persona.direccion ?? "No especificado...",
          nombres: trabajador.cita.persona.nombres,
          apellidoPaterno: trabajador.cita.persona.apellidoPaterno,
          apellidoMaterno: trabajador.cita.persona.apellidoMaterno,
          telefono: trabajador.cita.persona.telefono,
        }
      }

      const pdf = await generatePdf(data, `../extras/${req.params.tipo}.ejs`);
      res.contentType("application/pdf");
      res.setHeader("Content-Disposition", `inline; filename=${req.params.tipo === "convenio" ? "CONVENIO" : "ACUERDO"}_N${convenio.id}_${empleador.persona.apellidoPaterno}_${empleador.persona.apellidoMaterno}_${empleador.persona.nombres}.pdf`);
      return res.send(pdf);

    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Error en el servidor!" });
    }
  }
);

router.get("/convenio/get-count/",
  async (req: Request, res: Response) => {
      try {
          const count = await appDataSource.getRepository("convenio").count();
          return res.send({ count });
      } catch (error) {
          return res.status(500).send({ message: "Error en el servidor!" });
      }
  }
);

export default router;
