import { LessThan } from "typeorm";
import { appDataSource } from "../dataBase"
import { SesionActiva } from "../entities/sesionActiva";
import { toZonedTime } from "date-fns-tz";

export const cleanTokens = async () => {
    try {
        await appDataSource.getRepository(SesionActiva).delete({ expirationDate: LessThan(toZonedTime(new Date(), "America/Lima")) });
    } catch (error) {}
}