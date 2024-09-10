import { Injectable } from '@angular/core';
import { BACKEND_API_URL } from '../../Share/const';
import { HttpClient } from '@angular/common/http';
import { first, firstValueFrom } from 'rxjs';
import { TypeIncident } from './type_incident.model';


@Injectable({
    providedIn: 'root'
})
export class TypeIncidentService {

    typeIncidentUrl = `${BACKEND_API_URL}/typeIncidents`;

    constructor(private http: HttpClient){}

    getAll(): Promise<TypeIncident[]>{
        return firstValueFrom(
            this.http.get<TypeIncident[]>(this.typeIncidentUrl)
        );
    }

    getById(id: number): Promise<TypeIncident>{
        return firstValueFrom(
            this.http.get<TypeIncident>(`${this.typeIncidentUrl}/${id}`)
        );
    }

    create(TypeIncident: TypeIncident): Promise<TypeIncident>{
        return firstValueFrom(
            this.http.post<TypeIncident>(this.typeIncidentUrl, TypeIncident)
        );
    }

    update(TypeIncident: TypeIncident): Promise<TypeIncident>{
        return firstValueFrom(
            this.http.patch<TypeIncident>(`${this.typeIncidentUrl}/${TypeIncident.id}`, TypeIncident)
        );
    }

    delete(id: number): Promise<TypeIncident>{
        return firstValueFrom(
            this.http.delete<TypeIncident>(`${this.typeIncidentUrl}/${id}`)
        );
    }

}