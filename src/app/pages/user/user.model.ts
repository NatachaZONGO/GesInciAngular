import { Role } from "../role/role.model";

export interface User {
    id: number; 
    nom: string;
    prenom: string;
    email: string;
    password?: string; 
    confirmPassword?: string;
    roles: Role[];
}