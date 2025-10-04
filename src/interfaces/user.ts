// import { Employee } from "../entities/employee";

export interface currentUser {
    userName: string;
    password: string;
}

export interface IUser {
    userName: string;
    password: string;
    type: "Administrador" | "Moderador" | "Usuario";
    avatar: string;
}

export interface IUserUpdate {
    userName: string;
    names: string;
    password?: string;
    type: "Administrador" | "Moderador" | "Usuario";
}

export interface UserProfileUpdate {
    phoneNumber: string;
    avatar: string;
}

export interface ICreateUser {
    userName: string;
    password: string;
}
