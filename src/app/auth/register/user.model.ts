interface User {
    id:number;
    nom: string;
    prenom: string;
    email: string;  
}

export interface RegisterUser {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    confirmPassword: string;
}