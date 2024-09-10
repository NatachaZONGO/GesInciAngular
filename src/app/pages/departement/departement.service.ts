import { Departement } from './departement.model';
import { Injectable } from '@angular/core';
import { BACKEND_API_URL } from '../../Share/const';
import { HttpClient } from '@angular/common/http';
import { first, firstValueFrom } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class DepartementService {

    departementUrl = `${BACKEND_API_URL}/departements`;

    constructor(private http: HttpClient){}

    getAll(): Promise<Departement[]>{
        return firstValueFrom(
            this.http.get<Departement[]>(this.departementUrl)
        );
    }

    getById(id: number): Promise<Departement>{
        return firstValueFrom(
            this.http.get<Departement>(`${this.departementUrl}/${id}`)
        );
    }

    create(departement: Departement): Promise<Departement>{
        return firstValueFrom(
            this.http.post<Departement>(this.departementUrl, departement)
        );
    }

    update(departement: Departement): Promise<Departement>{
        return firstValueFrom(
            this.http.patch<Departement>(`${this.departementUrl}/${departement.id}`, departement)
        );
    }

    delete(id: number): Promise<Departement>{
        return firstValueFrom(
            this.http.delete<Departement>(`${this.departementUrl}/${id}`)
        );
    }

}