import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BACKEND_API_URL } from '../Share/const';
import { RegisterUser } from './register/user.model';
import { UserConnexion } from './connexion/userconnexion.model';


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    registerURL =BACKEND_API_URL+'/register';
    connexionURL =BACKEND_API_URL+'/login';

    constructor(private http: HttpClient) {}   

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
            this.http.post(this.registerURL, formData)
        );  
    }

//-----------------------------Connexion-------------------------------------------
    connexion ( userConnexion: UserConnexion): Promise<any> {
        let body = new HttpParams();    
        body.set ('email',userConnexion.email);    
        body.set ('password', userConnexion.password);    
        const formConnexionData = {
            'email': userConnexion.email,
            'password':  userConnexion.password,
        };
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        return firstValueFrom(
            //this.http.post(this.connexionURL, body.toString(), {headers})
            this.http.post(this.connexionURL, formConnexionData)
        );
    } 
}