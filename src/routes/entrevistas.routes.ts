import { Response, Router, Request } from "express";
import { validateReq } from "../middlewares/validateRequest";
import { checkSchema, param } from "express-validator";
import { appDataSource } from "../dataBase";
import { Between, Equal, Not, ObjectLiteral } from "typeorm";
import { ICreatedEntrevista } from "../interfaces/entrevista";
import { notEqual } from "assert";
import { validationToken } from "../middlewares/token";

const router = Router();

router.post(
  "/entrevistas/register/:idUser",
  param("idUser")
    .notEmpty()
    .isNumeric({ no_symbols: true })
    .withMessage("Error en el id de usuario"),
  checkSchema({
    dniTrabajador: {
      in: ["body"],
      isNumeric: true,
      notEmpty: true,
      errorMessage: "Error en el campo de dni trabajador!",
    },
    dniEmpleador: {
      in: ["body"],
      isNumeric: true,
      notEmpty: true,
      errorMessage: "Error en el campo de dni empleador!",
    },
    fechaEntrevista: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "Error en el campo de la fecha!",
    },
    observacion: {
      in: ["body"],
      optional: true,
      isString: true,
      errorMessage: "Ocurrio un error en el campo de observaciones!"
    },
    estado: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "Error en el campo de estado!",
    },
    pedidoId: {
      in: ["body"],
      isNumeric: true,
      notEmpty: true,
      errorMessage: "Debe seleccionar un pedido para poder registrar una entrevista!"
    }
  }),
  validateReq,
  validationToken,
  async (req: Request, res: Response) => {
    try {
      const trabajadorExiste = await appDataSource
        .getRepository("trabajador")
        .findOne({
          where: { cita: { persona: { dni: req.body["dniTrabajador"] } } },
        });
      if (!trabajadorExiste)
        return res.status(403).send({ message: "El trabajador no existe!" });

      const empleadorExiste = await appDataSource
        .getRepository("empleador")
        .findOne({ where: { persona: { dni: req.body["dniEmpleador"] } } });
      if (!empleadorExiste)
        return res.status(403).send({ message: "El empleador no existe!" });

      const usuario = await appDataSource.getRepository("usuario").findOne({ where: { id: req.params.idUser } });
      if (!usuario) return res.status(403).send({ message: "Ocurrio un error con el usuario!" });

      const entrevista = await appDataSource
        .getRepository("entrevista")
        .findOne({
          where: [
            {
              trabajador: {
                cita: {
                  persona: {
                    dni: req.body["dniTrabajador"],
                  },
                },
              },
              fechaEntrevista: Equal(req.body["fechaEntrevista"]),
              estado: Not("Finalizado"),
            },
            {
              empleador: {
                persona: {
                  dni: req.body["dniEmpleador"],
                },
              },
              fechaEntrevista: Equal(req.body["fechaEntrevista"]),
              estado: Not("Finalizado"),
            },
          ],
        });

      if (entrevista)
        return res.status(401).send({
          message:
            "El empleador o trabajador ya tiene una entrevista en dicha fecha!.",
        });

      const dni = req.body["dniEmpleador"];
      const { pedidoId } = req.body;
      delete req.body["pedidoId"];
      delete req.body["dniTrabajador"];
      delete req.body["dniEmpleador"];

      const pedido = await appDataSource.getRepository("pedido").findOne({ where: { id: pedidoId } });
      if (!pedido) return res.status(403).send({ message: "El pedido no se ha encontrado en la base de datos!" });

      // if (pedido.estado !== "Pendiente") return res.status(403).send({ message: 'El pedido solo se puede registrar si esta pendiente!' });

      const { ...newEntrevista } = {
        trabajador: trabajadorExiste,
        empleador: empleadorExiste,
        eliminado: false,
        pedido,
        ...req.body,
      };

      const createdEntrevista: ICreatedEntrevista = <ICreatedEntrevista>(
        (<unknown>{ ...newEntrevista }));
      const t = await appDataSource.getRepository("entrevista").save({ ...createdEntrevista, usuario });

      await appDataSource.getRepository("historial_usuario").save({
        usuario: req.params.idUser,
        seccion: "RECLUTAMIENTO",
        modulo: "ENTREVISTAS",
        descripcion: `REGISTRO UNA ENTREVISTA CON EL DNI EMPLEADOR: ${dni} E ID: ${t.id}`,
        accion: "AGREGAR",
        fecha: new Date()
      });

      return res.send({ message: "Se ha creado correctamente la entrevista!" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Error en el servidor" });
    }
  }
);

router.get("/entrevistas/get_all/", async (req: Request, res: Response) => {
  try {
    const data = await appDataSource.getRepository("entrevista").find({
      where: { eliminado: false },
      relations: ["trabajador.cita.persona", "empleador.persona", "pedido"],
      select: {
        id: true,
        fechaEntrevista: true,
        estado: true,
        observacion: true,
        trabajador: {
          id: true,
          codigoTrabajador: true,
          cita: {
            id: true,
            fechaCita: true,
            persona: {
              id: true,
              nombres: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              dni: true,
            },
          },
        },
        empleador: {
          id: true,
          persona: {
            id: true,
            nombres: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            dni: true,
          },
        },
        pedido: {
          id: true
        }
      },
      order: { id: "DESC" }
    });
    //!SE RETORNA DATA
    return res.send(data);
  } catch (error) {
    return res.status(500).send({ message: "Error en el servidor!" });
  }
});

router.put("/entrevistas/update/:id/:idUser",
  checkSchema({
    dniTrabajador: {
      in: ["body"],
      isNumeric: true,
      notEmpty: true,
      errorMessage: "Error en el campo de dni trabajador!",
    },
    estado: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      errorMessage: "Error en el campo de estado!, solo se puede modificar este campo"
    },
    fechaEntrevista: {
      in: ["body"],
      isISO8601: true,
      toDate: true,
      notEmpty: true,
      errorMessage: "Error en el campo de la fecha!",
    },
    observacion: {
      in: ["body"],
      optional: true,
      isString: true,
      errorMessage: "Ocurrio un error en el campo de observaciones!"
    },
    pedidoId: {
      in: ["body"],
      isNumeric: true,
      notEmpty: true,
      errorMessage: "Debe seleccionar un pedido para registrar una entrevista!."
    }
  }),
  param("idUser")
    .notEmpty()
    .isNumeric({ no_symbols: true })
    .withMessage("Error en el id de usuario"),
  param("id")
    .isNumeric({ no_symbols: true })
    .notEmpty()
    .withMessage("error en el campo de la id!."),
  async (req: Request, res: Response) => {
    try {
      const entrevista = await appDataSource.getRepository("entrevista").findOne({ where: { id: req.params["id"] }, relations: ["empleador", "empleador.persona", "pedido"] });
      if (!entrevista) return res.send({ message: "No se ha encontrado la entrevista!" });

      const pedido = await appDataSource.getRepository("pedido").findOne({ where: { id: req.body.pedidoId, eliminado: false } });
      if (!pedido) return res.status(403).send({ message: "El pedido no se encontro en la base de datos!" });

      // if (pedido.estado !== "Pendiente") return res.status(403).send({ message: 'El pedido solo se puede registrar si esta pendiente!' });

      const trabajador = await appDataSource.getRepository("trabajador").findOne({ where: { cita: { persona: { dni: req.body.dniTrabajador } } } });
      if (!trabajador) return res.status(403).send({ message: "El trabajador no existe!" });

      await appDataSource.getRepository("historial_usuario").save({
        usuario: req.params.idUser,
        seccion: "RECLUTAMIENTO",
        modulo: "ENTREVISTAS",
        descripcion: `MODIFICO UNA ENTREVISTA CON EL DNI: ${entrevista.empleador.persona.dni} E ID: ${entrevista.id}`,
        accion: "MODIFICAR",
        fecha: new Date()
      });

      await appDataSource.getRepository("entrevista").update({ id: req.params["id"] }, { estado: req.body["estado"], pedido, trabajador, observacion: req.body["observacion"], fechaEntrevista: req.body["fechaEntrevista"]});
      return res.send({ message: "Se ha actualizado correctamente la entrevista!!" });
    } catch (error) {
      return res.status(500).send({ message: "Error en el servidor!" });
    }
  }
);

router.put("/entrevistas/reprogramar/:id/:idUser",
  checkSchema({
    fechaEntrevista: {
      in: ["body"],
      notEmpty: true,
      isISO8601: true,
      toDate: true,
      errorMessage: "Error en el campo de la fecha!"
    }
  }),
  param("idUser")
    .notEmpty()
    .isNumeric({ no_symbols: true })
    .withMessage("Error en el id de usuario"),
  param("id")
    .isNumeric({ no_symbols: true })
    .notEmpty()
    .withMessage("Error en el parametro id, debe ser numerico!"),
  async (req: Request, res: Response) => {
    try {
      const entrevista = await appDataSource.getRepository("entrevista").findOne({ where: { id: req.params["id"] }, relations: ["trabajador", "empleador", "empleador.persona", "pedido"], select: { trabajador: { id: true }, empleador: { id: true } } });
      if (!entrevista) return res.status(403).send({ message: "No se encontro la entrevista!!" });

      if (entrevista["estado"] === "Reprogramada") return res.status(403).send({ message: "No se puede reprogramar una entrevista ya reprogramada!" });

      if (new Date(req.body["fechaEntrevista"]).toISOString() === new Date(entrevista["fechaEntrevista"]).toISOString())
        return res.status(403).send({ message: "Se ha ingresado la misma fecha!" });

      const { ...newEntrevista } = {
        fechaEntrevista: req.body["fechaEntrevista"],
        estado: "Pendiente",
        eliminado: false,
        trabajador: entrevista.trabajador,
        empleador: entrevista.empleador,
        pedido: entrevista.pedido
      };
      const newCreatedEntrevista: ICreatedEntrevista = <ICreatedEntrevista>(<unknown>{ ...newEntrevista });
      const data = await appDataSource.getRepository("entrevista").save(newCreatedEntrevista);
      // console.log(data);
      await appDataSource.getRepository("entrevista").update({ id: req.params["id"] }, { estado: "Reprogramada" });

      await appDataSource.getRepository("historial_usuario").save({
        usuario: req.params.idUser,
        seccion: "RECLUTAMIENTO",
        modulo: "ENTREVISTAS",
        descripcion: `REPROGRAMO UNA ENTREVISTA CON EL DNI EMPLEADOR: ${data.empleador.persona.dni} E ID: ${data.id}`,
        accion: "REPROGRAMAR",
        fecha: new Date()
      });

      return res.send({ message: "La entrevista se ha reprogramado!" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Error en el servidor!" });
    }
  });

router.post("/entrevistas/get_all_by_dni/:dni",
  param("dni")
    .notEmpty()
    .isNumeric({ no_symbols: true }),
  async (req: Request, res: Response) => {
    try {
      const empleador = await appDataSource.getRepository("empleador").findOne({ where: { persona: { dni: req.params.dni }, eliminado: false } });
      if (!empleador) return res.status(403).send({ message: "El empleador no se ha encontrado en la base de datos!" });

      const entrevistas = await appDataSource.getRepository("entrevista").find({ where: { empleador, eliminado: false }, relations: ["trabajador", "trabajador.cita", "trabajador.cita.persona", "pedido", "pedido.horarioPedido", "pedido.modalidad", "pedido.puesto", "pedido.funcionesPedido", "pedido.funcionesPedido.funcion"] });
      if (entrevistas.length === 0) return res.status(403).send({ message: "No hay entrevistas presentes para este empleador!" });

      return res.send(entrevistas.map((entrevista: ObjectLiteral) => {
        const { fechaEntrevista, trabajador, pedido, observacion } = entrevista;
        const { cita } = trabajador;
        const { persona } = cita;
        const { modalidad, puesto, horarioPedido, funcionesPedido } = pedido;
        const { id, ...rest } = horarioPedido;
        const funciones = funcionesPedido.map((funcionT: any) => funcionT.funcion.descripcion);

        return {
          id: entrevista.id,
          dniTrabajador: persona.dni,
          trabajador: `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`,
          // nombresTrabajador: persona.nombres,
          // apellidoPaternoTrabajador: persona.apellidoPaterno,
          // apellidoMaternoTrabajador: persona.apellidoMaterno,
          fechaEntrevista,
          modalidad: modalidad.descripcion,
          puesto: puesto.descripcion,
          movilidad: pedido.movilidad,
          periocidad: pedido.periocidad,
          sueldo: pedido.sueldo,
          estadoPedido: pedido.estadoPedido ?? "No Especificado...",
          horarioPedido: rest,
          funciones
        }
      }));
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Error en el servidor!" });
    }
  }
);

router.delete("/entrevistas/delete/:id/:idUser",
  param("id")
    .isNumeric({ no_symbols: true })
    .notEmpty()
    .withMessage("error en el campo de la id"),
  param("idUser")
    .notEmpty()
    .isNumeric({ no_symbols: true })
    .withMessage("Error en el id de usuario"),
  async (req: Request, res: Response) => {
    try {
      const entrevista = await appDataSource.getRepository("entrevista").findOne({ where: { id: req.params.id }, relations: ["empleador", "empleador.persona"] });
      if (!entrevista) return res.status(403).send({ message: "La entrevista no existe!" });

      await appDataSource.getRepository("entrevista").update({ id: req.params["id"] }, { eliminado: true });

      await appDataSource.getRepository("historial_usuario").save({
        usuario: req.params.idUser,
        seccion: "RECLUTAMIENTO",
        modulo: "ENTREVISTAS",
        descripcion: `ELIMINO UNA ENTREVISTA CON EL DNI EMPLEADOR: ${entrevista.empleador.persona.dni} E ID: ${entrevista.id}`,
        accion: "ELIMINAR",
        fecha: new Date()
      });
      return res.send({ message: "Se ha eliminado correctamente la entrevista!!" });
    } catch (error) {
      return res.status(500).send({ message: "Error en el servidor!" });
    }
  }
);

router.get("/entrevista/get-count/",
  async (req: Request, res: Response) => {
      try {
          const count = await appDataSource.getRepository("entrevista").count({ where: { eliminado: false } });
          return res.send({ count });
      } catch (error) {
          return res.status(500).send({ message: "Error en el servidor!" });
      }
  }
);

export default router;
