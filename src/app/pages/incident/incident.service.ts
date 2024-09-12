import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BACKEND_API_URL } from '../../Share/const';

@Injectable({
    providedIn: 'root'
})
export class IncidentService {

    private incidentUrl = `${BACKEND_API_URL}/incidents`; 

    constructor(private http: HttpClient) {}


// recuperer la liste des incidents
    getAll(): Promise<any> {
        return firstValueFrom(
            this.http.get<any>(this.incidentUrl)
        );
    }
    // Créer un nouvel incident
    create(data: any): Promise<any> {
        return firstValueFrom(
            this.http.post<any>(this.incidentUrl, data)
        );
    }

    // Mettre à jour un incident existant
    update(id: number, data: any): Promise<any> {
        return firstValueFrom(
            this.http.patch<any>(`${this.incidentUrl}/${id}`, data)
        );
    }

    // Supprimer un incident par ID
    delete(id: number): Promise<any> {
        return firstValueFrom(
            this.http.delete<any>(`${this.incidentUrl}/${id}`)
        );
    }

    // Récupérer un incident par son ID
    getIncidentById(id: number): Promise<any> {
        return firstValueFrom(
            this.http.get<any>(`${this.incidentUrl}/${id}`)
        );
    }
}
