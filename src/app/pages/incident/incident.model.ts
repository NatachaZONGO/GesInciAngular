import { Service } from "../service/service.model"
import { TypeIncident } from "../type_incident/type_incident.model"
import { User } from "../user/user.model"

export interface Incident {
    id: number,
    nom: string,
    type_incident_id: number,
    type_incident: TypeIncident,
    description: string,
    priorite: string,
    service_id: number,
    service: Service,
    soumis_par: User,
    date_soumission: Date,
    prise_en_charge_par: User,
    date_prise_en_charge: Date,
    statut: string,
    commentaires: string, 
}
export enum IncidentStatut{
    EN_COURS = "en_cours",
}

export const AllPrioriteIncident = {
    FAIBLE: {label: 'Faible', value: 'faible'},
    MOYENNE: {label: 'Moyenne', value: 'moyenne'},
    FORTE: {label: 'Forte', value: 'forte'},
}

export const AllStatutsIncident = {
    FAIBLE: {label: 'En cours', value: 'en_cours'},
    MOYENNE: {label: 'Traite', value: 'traite'},
    FORTE: {label: 'Annule', value: 'annule'},
}