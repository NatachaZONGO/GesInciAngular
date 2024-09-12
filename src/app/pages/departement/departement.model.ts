import { Service } from "../service/service.model";

export interface Departement {
    id: number,
    nom: string,
    description: string,
    services:Service[]
}