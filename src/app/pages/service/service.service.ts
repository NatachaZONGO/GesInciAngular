import { Injectable } from '@angular/core';
import { BACKEND_API_URL } from '../../Share/const';
import { HttpClient } from '@angular/common/http';
import { first, firstValueFrom } from 'rxjs';
import { Service } from './service.model';


@Injectable({
    providedIn: 'root'
})
export class ServiceService {

    serviceUrl = `${BACKEND_API_URL}/services`;

    constructor(private http: HttpClient){}

    getAll(): Promise<Service[]>{
        return firstValueFrom(
            this.http.get<Service[]>(this.serviceUrl)
        );
    }

    getById(id: number): Promise<Service>{
        return firstValueFrom(
            this.http.get<Service>(`${this.serviceUrl}/${id}`)
        );
    }

    create(service: Service): Promise<Service>{
        return firstValueFrom(
            this.http.post<Service>(this.serviceUrl, service)
        );
    }

    update(service: Service): Promise<Service>{
        return firstValueFrom(
            this.http.patch<Service>(`${this.serviceUrl}/${service.id}`, service)
        );
    }

    delete(id: number): Promise<Service>{
        return firstValueFrom(
            this.http.delete<Service>(`${this.serviceUrl}/${id}`)
        );
    }

}