import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { BACKEND_API_URL, BACKEND_URL, LocalStorageFields, SANCTUM_CSRF } from '../Share/const';
import { RegisterUser } from './register/user.model';
import { UserConnexion } from './connexion/userconnexion.model';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    accessToken?: string;

    constructor(private http: HttpClient) {
        this.accessToken = localStorage.getItem(LocalStorageFields.accessToken) ?? undefined;
    }   

    //-----------------------------Inscription-------------------------------------------
    register( registerData: RegisterUser): Promise<any> {
        let body = new HttpParams();    
        body.set ('nom',registerData.nom);    
        body.set ('email', registerData.email);    
        body.set ('password', registerData.password);    
        body.set ('confirmPassword', registerData.confirmPassword);
        const formData = {
            'nom': registerData.nom,
            'prenom': registerData.prenom,
            'email':  registerData.email,
            'password':  registerData.password,
            'confirmPassword':  registerData.confirmPassword,
        };
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        return firstValueFrom(
            //this.http.post(this.registerURL, body.toString(), {headers})
            this.http.post(BACKEND_API_URL+"/register", formData, {withCredentials: true})
        );  
    }

//-----------------------------Connexion-------------------------------------------
    connexion ( userConnexion: UserConnexion): Promise<any>{   
        return firstValueFrom(
            this.http.post<{access_token: string}>(BACKEND_API_URL+"/login", userConnexion).pipe(
                tap(
                    (resutl)=>{
                        this.accessToken = resutl.access_token;
                        localStorage.setItem(LocalStorageFields.accessToken, this.accessToken);
                    }
                )
            )
        );
    } 

    logout() {
        this.accessToken = undefined;
        localStorage.removeItem(LocalStorageFields.accessToken);
    }
}