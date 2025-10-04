import { validationToken } from "../middlewares/token";
import { Router, Request, Response } from "express";
import * as dotenv from "dotenv";
import { checkSchema, param } from "express-validator";
import { validateReq } from "../middlewares/validateRequest";
import { appDataSource } from "../dataBase";
import { Usuario } from "../entities/usuario";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { IUserUpdate, UserProfileUpdate } from "../interfaces/user";
import { IUser } from "../interfaces/user";
import { SesionActiva } from "../entities/sesionActiva";
import { ObjectLiteral } from "typeorm";

const router = Router();
dotenv.config();

router.post("/user/login/",
    checkSchema({
        userName: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "username invalido, evita los espacios vacios o caracteres incorrectos."
        },
        password: {
            in: ["body"],
            isLength: {
                options: { max: 30, min: 8 },
                errorMessage: "max: 30 | min: 8 caracteres validos, contraseña incorrecta!"
            },
            isString: { errorMessage: "la constraseña solo debe contener letras y numeros" }
        },
        device: {
            in: ["body"],
            isString: true,
            notEmpty: { errorMessage: "el dispositivo no puede tener campos vacios!" }
        }
    }),
    validateReq,
    async (req: Request, res: Response) => {
        try {
            const userToAuth = await appDataSource.getRepository("usuario").findOne({ where: { userName: req.body["userName"], eliminado: false } });
            if (!userToAuth) return res.status(403).json({ message: "el usuario no existe o no tiene acceso!" });

            if (!await bcrypt.compare(req.body["password"], userToAuth["password"])) return res.status(401).json({ message: "contraseña erronea!" });

            const accessToken = await jwt.sign({
                userName: userToAuth["userName"],
                id: userToAuth["id"]
            }, process.env.ACCESS_TOKEN_SECRET!,
            {
                expiresIn: "6hr",
            });

            const verifySession = await appDataSource.getRepository(SesionActiva).findOne({ where: { usuario: userToAuth } });
            if (verifySession) return res.status(403).json({ message: "el usuario ya esta logueado!" });

            const decodedToken: jwt.JwtPayload = jwt.decode(accessToken, { json: true })!;
            const creationDate: Date = new Date(decodedToken.iat! * 1000);
            const expirationDate: Date = new Date(decodedToken.exp! * 1000);
            const activeSession: any = {
                usuario: userToAuth,
                device: req.body["device"],
                creationDate: creationDate,
                expirationDate: expirationDate,
                jwt: accessToken
            }

            console.log(userToAuth.userName);

            if (userToAuth.userName !== "SBSS" && userToAuth.userName !== "FJAC") {
                await appDataSource.getRepository(SesionActiva).save(activeSession);
            }


            return res.send({
                message: "logeo existoso!",
                jwt: accessToken,
                type: userToAuth.type,
                id: userToAuth.id,
                expirationDate: expirationDate,
                userName: userToAuth.userName
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    });

router.get("/user/isLogged/:id",
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true }),
    validateReq,
    // validationToken,
    async (req: Request, res: Response) => {
        try {
            const isLogged = await appDataSource.getRepository("sesion_activa").findOne({ where: { usuario: { id: req.params.id } } });
            if (!req.params.id) return res.status(403).send({ message: "No hay id" });
            return res.send({ status: isLogged ? true : false });
        } catch (error) {
            return res.status(500).send({ message: 'Error en el servidor!' });
        }
    }
);

router.get("/user/get_session_active/all/",
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const data = await appDataSource.getRepository("sesion_activa").find({ relations: ["usuario"] });

            return res.send(data.map((sesion: ObjectLiteral) => ({
                userName: sesion.usuario.userName,
                names: sesion.usuario.names,
                type: sesion.usuario.type,
                id: sesion.id,
                creationDateSession: sesion.creationDate,
                expirationDate: sesion.expirationDate
            })));
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.delete("/user/close_session/:id",
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true }),
    validateReq,
    validationToken,
    async (req: Request, res: Response) => {
        try {
            await appDataSource.getRepository("sesion_activa").delete({ id: req.params.id });
            return res.send({ message: "Se ha cerrado la sesion del usuario!" });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

router.post("/user/register/",
    checkSchema({
        userName: {
            in: ["body"],
            isString: true,
            isLength: {
                options: { max: 10, min: 3 },
                errorMessage: "El nombre de usuario debe tener 3 a 10 caracteres."
            },
            notEmpty: true,
            errorMessage: "username invalido!!",
        },
        password: {
            in: ["body"],
            isLength: {
                options: { max: 30, min: 8 },
                errorMessage: "max: 30 | min: 5 caracteres! contraseña invalida"
            },
            isAlphanumeric: { errorMessage: "la contraseña debe contener solo letras y numeros!" }
        },
        type: {
            in: ["body"],
            custom: {
                options: (value: string) => value === "ADMINISTRADOR" || value === "SELECCION" || value === "RECLUTAMIENTO"
            },
            isString: true,
            notEmpty: true,
            errorMessage: "Tipo de usuario invalido."
        },
        avatar: {
            in: ["body"],
            optional: true,
            isString: true,
            errorMessage: "Ocurrio un error al subir la imagen."
        }
    }),
    validateReq,
    // validationToken,
    async (req: Request, res: Response) => {
        try {
            const userAlreadyExists = await appDataSource.getRepository("usuario").findOne({ where: { userName: req.body["userName"] } });
            if (userAlreadyExists) return res.status(403).json({ message: "el usuario ya existe!" });

            const { ...user } = req.body;
            const newUser: IUser = <IUser>(<unknown>{ ...user });

            newUser["password"] = await bcrypt.hash(newUser["password"], 8);
            const data = await appDataSource.getRepository("usuario").save({ ...newUser, eliminado: false });
            const { userName } = data;

            return res.send({
                userName: userName
            });
        } catch (error) { return res.status(500).json({ message: error }); }
    });


router.get("/user/get_all/",
    validationToken,
    async (_: Request, res: Response) => {
        try {
            const allUsers = await appDataSource.getRepository("usuario").find({ where: { eliminado: false } });
            if (!allUsers) return res.status(403).send({ message: "error al encontrar los usuarios!" })

            allUsers.forEach((user) => {
                // console.log(user["type"]);
                const { password } = user;
                user["password"] = password.slice(0, 20);
            });

            return res.send(allUsers);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: error });
        }
    }
)

router.get("/user/get_by_userName/:userName",
    param("userName")
        .isString()
        .withMessage("el id debe ser entero!"),
    validateReq,
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const userById = await appDataSource.getRepository("usuario").findOne({ where: { userName: req.params["userName"] } });
            if (!userById) return res.status(403).send({ message: "el usuario no existe!", status: false });

            return res.send({
                message: "usuario encontrado!",
                userId: userById.id
            });
        } catch (error) {
            return res.status(500).send({
                message: "error en el servidor!",
                error: error
            });
        }
    }
);

router.get("/user/get_by_id/:id",
    param("id")
        .isNumeric()
        .withMessage("el id debe ser entero!"),
    validateReq,
    // validationToken,
    async (req: Request, res: Response) => {
        try {
            const userById = await appDataSource.getRepository("usuario").findOne({ where: { id: req.params["id"] } });
            if (!userById) return res.status(403).send({ message: "el usuario no existe!", status: false });

            return res.send({
                message: "usuario encontrado!",
                userId: userById,
            });
        } catch (error) {
            return res.status(500).send({
                message: "error en el servidor!",
                error: error
            });
        }
    }
);



router.put("/user/edit_profile_by_id/:id",
    param("id")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .withMessage("error en el campo id"),
    checkSchema({
        phoneNumber: {
            in: ["body"],
            isNumeric: true,
            notEmpty: true,
            errorMessage: "error en el campo phonenumber"
        },
        avatar: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "error en el campo avatar"
        }
    }),
    validateReq,
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const user = await appDataSource.getRepository("usuario").findOne({ where: { id: req["params"]["id"] } });
            if (!user) return res.status(403).send({ message: "el usuario no existe!" });

            if (user.password === user.password.slice(0, 20)) return res.status(403).send({ message: "Tiene que poner una nueva contraseña" });

            const { ...updateUser } = req.body;
            const updatedUser: UserProfileUpdate = <UserProfileUpdate>(<unknown>{ ...updateUser });
            console.log(updatedUser)
            await appDataSource.getRepository("usuario").update({ id: req.params["id"] }, { avatar: updatedUser["avatar"] });
            // await appDataSource.getRepository("usuario").update({ id: req.params["id"] }, { employee: { person: { phoneNumber: updatedUser["phoneNumber"] } } });
            return res.send({ message: "se ha actualizado correctamente!" });
        } catch (error) {
            console.log(error);
        }
    }
);

router.put("/user/edit_by_id/:id",
    checkSchema({
        userName: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "userName invalido!!",
        },
        password: {
            in: ["body"],
            optional: true,
            isLength: {
                options: { max: 30, min: 5 },
                errorMessage: "max: 30 | min: 5 caracteres validos, contraseña incorrecta!"
            },
            isAlphanumeric: { errorMessage: "la contraseña solo debe contener letras y numeros" }
        },
        names: {
            in: ["body"],
            isString: true,
            notEmpty: true,
            errorMessage: "nombres invalidos, evita los espacios vacios o caracteres incorrectos."
        },
        type: {
            in: ["body"],
            custom: {
                options: (value: string) => value === "Administrador" || value === "Moderador" || value === "Usuario"
            },
            isString: true,
            notEmpty: true,
            errorMessage: "Tipo de usuario invalido."
        }
    }),
    param("id")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .withMessage("el id debe ser numerico!"),
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const userToEdit = await appDataSource.getRepository("usuario").findOne({ where: { id: req.params["id"] } });
            if (!userToEdit) return res.status(403).send({ message: "el usuario no existe!" });
            if (req.body["password"] === userToEdit.password.slice(0, 20)) {
                delete req.body["password"];
                const { ...userData } = req.body;
                const userToUpdate: IUserUpdate = <IUserUpdate>(<unknown>{ ...userData });
                const { userName, type, names } = userToUpdate;
                await appDataSource.getRepository("usuario").update({ id: userToEdit["id"] }, { userName: userName, type: type, names });
            } else {
                const { ...userData } = req.body;
                const userToUpdate: IUserUpdate = <IUserUpdate>(<unknown>{ ...userData });
                userToUpdate["password"] = await bcrypt.hash(req.body["password"], 8);
                const { userName, password, type, names } = userToUpdate;
                await appDataSource.getRepository("usuario").update({ id: userToEdit["id"] }, { userName: userName, password: password, type: type, names });
            }

            return res.send({
                message: "el usuario se ha actualizado!"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "error en el servidor!" });
        }
    }
);

router.delete("/user/log_out/:id",
    param("id")
        .notEmpty()
        .isNumeric({ no_symbols: true })
        .withMessage("error en el campo id"),
    async (req: Request, res: Response) => {
        try {
            await appDataSource.getRepository(SesionActiva).delete({ usuario: { id: Number(req.params["id"]) } });
            return res.send({ message: "el usuario ha cerrado sesion correctamente!" });
        } catch (error) {
            return res.status(500).send({ message: "error interno en el servidor!" });
        }
    }
)

router.delete("/user/delete/:id",
    param("id")
        .isNumeric({ no_symbols: true })
        .notEmpty()
        .withMessage("error en el campo de la id"),
    validationToken,
    async (req: Request, res: Response) => {
        try {
            const userTemp = await appDataSource.getRepository("usuario").findOne({ where: { id: req.params.id } });
            await appDataSource.getRepository("usuario").update({ id: req.params["id"] }, { eliminado: userTemp!.eliminado ? false : true });
            return res.send({ message: "Se ha habilitado/deshabilitado correctamente al usuario!" });
        } catch (error) {
            return res.status(500).send({ message: "Error en el servidor!" });
        }
    }
);

export default router;