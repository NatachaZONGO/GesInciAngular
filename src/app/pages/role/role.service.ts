import { Injectable } from '@angular/core';
import { BACKEND_API_URL } from '../../Share/const';
import { HttpClient } from '@angular/common/http';
import { first, firstValueFrom } from 'rxjs';
import { Role } from './role.model';

@Injectable({
    providedIn: 'root'
})
export class RoleService {

    roleUrl = `${BACKEND_API_URL}/roles`;

    constructor(private http:  HttpClient){}

    getAll(): Promise<Role[]>{
        return firstValueFrom(
            this.http.get<Role[]>(this.roleUrl)
        );
    }

    getById(id: number): Promise<Role>{
        return firstValueFrom(
            this.http.get<Role>(`${this.roleUrl}/${id}`)
        );
    }

    create(role: Role): Promise<Role>{
        return firstValueFrom(
            this.http.post<Role>(this.roleUrl, role)
        );
    }

    update(role: Role): Promise<Role>{
        return firstValueFrom(
            this.http.patch<Role>(`${this.roleUrl}/${role.id}`, role)
        );
    }

    delete(id: number): Promise<Role>{
        return firstValueFrom(
            this.http.delete<Role>(`${this.roleUrl}/${id}`)
        );
    }

}