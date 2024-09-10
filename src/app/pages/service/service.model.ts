import { Departement } from "../departement/departement.model";

export interface Service {
    id: number,
    nom: string,
    departement_id: number,
    description: string,
    departement: Departement,
}