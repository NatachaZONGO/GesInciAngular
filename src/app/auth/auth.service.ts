import { Role } from './../pages/role/role.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, Signal, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, switchMap, tap } from 'rxjs';
import { BACKEND_API_URL, BACKEND_URL, LocalStorageFields, SANCTUM_CSRF } from '../Share/const';
import { RegisterUser } from './register/user.model';
import { UserConnexion } from './connexion/userconnexion.model';
import { User } from '../pages/user/user.model';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    accessToken?: string;
    private _rolesNames = signal<string[]>([]);

    get rolesNames(): Signal<string[]>{
        return this._rolesNames;
    }

    // Utilisation d'un BehaviorSubject pour émettre l'état de l'utilisateur connecté
    private utilisateurConnecteSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    utilisateurConnecte$: Observable<any> = this.utilisateurConnecteSubject.asObservable();

    constructor(private http: HttpClient) {
        this.accessToken = localStorage.getItem(LocalStorageFields.accessToken) ?? undefined;
        const json_roles = localStorage.getItem(LocalStorageFields.roles_name) ?? '[]';
        this._rolesNames.set(JSON.parse(json_roles) as string[]);
    
        const utilisateur = localStorage.getItem('utilisateur');
        if (utilisateur) {
            try {
                const user = JSON.parse(utilisateur);
                this.utilisateurConnecteSubject.next(user);
                console.log('Utilisateur récupéré du localStorage:', user);
            } catch (e) {
                console.error('Erreur lors du parsing de l\'utilisateur:', e);
            }
        } else {
            console.warn('Aucun utilisateur trouvé dans le localStorage');
            this.utilisateurConnecteSubject.next(null); // Émettre null si aucun utilisateur
        }
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
            this.http.post(BACKEND_API_URL+"/register", {'nom': registerData.nom,
                'prenom': registerData.prenom,
                'email':  registerData.email,
                'password':  registerData.password,
                'confirmPassword':  registerData.confirmPassword})
        );  
    }


//-----------------------------Connexion-------------------------------------------
connexion(userConnexion: UserConnexion): Promise<any> {
    return firstValueFrom(
        this.http.post<{ access_token: string, user: User, roles: Role[]}>(BACKEND_API_URL + "/login", userConnexion).pipe(
            tap(async (result) => {
                console.log(result);
                // Vérifier si le token d'accès est présent
                if (result.access_token) {
                    this.accessToken = result.access_token;
                    localStorage.setItem(LocalStorageFields.accessToken, this.accessToken);

                    localStorage.setItem('utilisateur', JSON.stringify(result.user));
                        console.log(result.user);

                        // Émettre l'utilisateur connecté
                    this.utilisateurConnecteSubject.next(result.user);

                    this._rolesNames.set(result.roles.map(role => role.nom));
                    localStorage.setItem(LocalStorageFields.roles_name, JSON.stringify(this._rolesNames()));
                    console.log("LISTE DE ROLES");  
                    console.log(result);
                } else {
                    console.error('Token d\'accès manquant dans la réponse de connexion');
                }

                // Retourner les rôles de l'utilisateur connecté
                //return this.getConnectedUserRoles();
            }),
        )
    );
}

    logout() {
        this.accessToken = undefined;
        localStorage.removeItem(LocalStorageFields.accessToken);
        localStorage.removeItem(LocalStorageFields.roles_name);
    }

    getConnectedUserRoles(): Observable<Role[]>{
        return this.http.get<Role[]>(BACKEND_API_URL+"/getConnectedUserRoles").pipe(
            tap(roles => {
                this._rolesNames.set(roles.map(role => role.nom));
                localStorage.setItem(LocalStorageFields.roles_name, JSON.stringify(this._rolesNames()));
                console.log("LISTE DE ROLES");  
                console.log(roles);
            })
        )
    } 


    getCurrentUserInfos(id: number): Observable<any> {
        return this.http.get(`${BACKEND_API_URL}/getConnectedUserInfos`);
    }
    
    getCurrentUserId(): number | null {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          const parsedUser = JSON.parse(user);
          return parsedUser.id; // Assurez-vous que l'objet utilisateur a bien la propriété id
        }
        return null;
      }
}