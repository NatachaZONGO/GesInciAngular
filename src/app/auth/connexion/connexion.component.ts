import { AuthService } from './../auth.service';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserConnexion } from './userconnexion.model';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { LoadingComponent } from '../../Share/loading/loading.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-name',
    templateUrl: './connexion.component.html',
    styleUrls: ['./connexion.component.scss'],
    standalone: true,
    imports: [
        LoadingComponent,
        InputTextModule,
        FloatLabelModule,
        ButtonModule,
        ReactiveFormsModule
    ]
})
export class ConnexionComponent implements OnInit {
    isLoading = signal(false);
    formulaireconnexion! : FormGroup;
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void { 
        this.initForm();
    }

    initForm(){
        this.formulaireconnexion = this.fb.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        })
    }

    
    async connexion () {
        this.isLoading.set(true);
        try {
            console.log(this.formulaireconnexion.value);
            const userConnexion: UserConnexion = this.formulaireconnexion.value as UserConnexion;
            const resultat = await this.authService.connexion(userConnexion);
            console.log(resultat);
            this.router.navigateByUrl("");
        } catch (error) {
            console.log(error);
        }finally{
            this.isLoading.set(false);
        }
    } 

    //fonction de mot de passe oublie l'utilisateur sera rediriger vers un formulaire ou il va renseigner son email
    onForgotPassword() {

}

}
