export interface Incident {
    id: number,
    nom: string,
    type_incident_id: number,
    tye_incident: string,
    description: string,
    priorite: string,
    service_id: number,
    soumis_par: string,
    date_soumission: Date,
    prise_en_charge_par: string,
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

export const AllPrioritesTATUS = {
    FAIBLE: {label: 'En cours', value: 'en_cours'},
    MOYENNE: {label: 'Traite', value: 'traite'},
    FORTE: {label: 'Annule', value: 'annule'},
}