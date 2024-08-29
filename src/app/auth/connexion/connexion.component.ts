import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserConnexion } from './userconnexion.model';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-name',
    templateUrl: './connexion.component.html',
    styleUrls: ['./connexion.component.scss'],
    standalone: true,
    imports: [
        InputTextModule,
        FloatLabelModule,
        ButtonModule,
        ReactiveFormsModule
    ]
})
export class ConnexionComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private AuthService: AuthService
    ) { }

    ngOnInit(): void { 
        this.initForm();
    }

    formulaireconnexion! : FormGroup;
    initForm(){
        this.formulaireconnexion = this.fb.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        })
    }

    
    async connexion () {
        console.log(this.formulaireconnexion.value);
        const userConnexion: UserConnexion = this.formulaireconnexion.value as UserConnexion;
        const resultat = await this.AuthService.connexion(userConnexion);
        console.log(resultat);
    } 

    //fonction de mot de passe oublie l'utilisateur sera rediriger vers un formulaire ou il va renseigner son email
    onForgotPassword() {

}

}
