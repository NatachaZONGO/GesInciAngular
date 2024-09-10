import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from './user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private userUrl = 'http://127.0.0.1:8000/api';
    constructor(private http: HttpClient) { }

    getAll(): Promise<User[]> {
        return firstValueFrom(
            this.http.get<User[]>(this.userUrl +'/users')
        );
    }
    
    getAllWithRoles(): Promise<User[]> {
        return firstValueFrom(
            this.http.get<User[]>(this.userUrl +'/getUsersWithRoles')
        );
    }

    getById(id: number): Promise<User> {
        return firstValueFrom(
            this.http.get<User>(`${this.userUrl}/${id}`)
        );
    }

    create(user: User): Promise<User> {
        return firstValueFrom(
            this.http.post<User>(this.userUrl +'/register', user)
        );
    }

    update(user: User): Promise<User> {
        return firstValueFrom(
            this.http.put<User>(`${this.userUrl}/updateUser/${user.id}`, user)
        );
    }

    delete(id: number): Promise<User> {
        return firstValueFrom(
            this.http.delete<User>(`${this.userUrl}/deleteUser/${id}`)
        );
    }

    attachDetachRole(userId:number, rolesId: number[]): Promise<any>{
        return firstValueFrom(
            this.http.post(`${this.userUrl}/attachDetachRoles/${userId}`, {"roles": rolesId})
        );
    }

}