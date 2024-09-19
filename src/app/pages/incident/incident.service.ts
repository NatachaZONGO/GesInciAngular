import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BACKEND_API_URL } from '../../Share/const';
import { Incident } from './incident.model';

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

   affecter(userId: number, incidentId: number){
    return firstValueFrom(
        this.http.put<any>(`${BACKEND_API_URL}/incidents_/${incidentId}/affectInciUser/${userId}`, {})
    )
   }

  
    // Méthode pour mettre à jour le commentaire d'un incident
  addComment(incidentId: number, commentaire: string): Promise<any> {
    const url = `${BACKEND_API_URL}/incidents_/addComment/${incidentId}`;
    return this.http.put(url, { commentaires: commentaire }).toPromise();
  }

  //Methode pour afficher les informations d'un incident specifique
  getIncidentSpecifique(id: number): Promise<Incident> {
    return firstValueFrom(
      this.http.get<Incident>(`${this.incidentUrl}/${id}`)
    );
  }

  //Methode pour modifier la priorité d'un incident
  updatePriority(incidentId: number, priorite: string): Promise<any> {
    const url = `${this.incidentUrl}/priorite/${incidentId}`;
   return this.http.put(url, {priorite: priorite}).toPromise();
   
  }

  // Méthode pour mettre à jour le statut d'un incident
  updateStatut(incidentId: number, statut: string): Promise<Incident> {
    const url = `${this.incidentUrl}/statut/${incidentId}`;
    return this.http.put<Incident>(url, { statut })
      .toPromise()
      .then(response => {
        if (response === undefined) {
          return Promise.reject(new Error('Incident not found'));
        }
        return response;
      })
      .catch(error => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        return Promise.reject(error);
      });
  }
  
}