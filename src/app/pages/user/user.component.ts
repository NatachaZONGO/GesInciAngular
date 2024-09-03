import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from './user.model';
import { Table, TableModule } from 'primeng/table';
import { UserService } from './user.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { LoadingComponent } from '../../Share/loading/loading.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea, InputTextareaModule } from 'primeng/inputtextarea';
import { SidebarModule } from 'primeng/sidebar';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: true,
    imports: [
        TableModule,
        ButtonModule,
        DialogModule,
        ReactiveFormsModule,
        LoadingComponent,
        FloatLabelModule,
        InputTextModule,
        InputTextareaModule,
        SidebarModule
    ]
})
export class UserComponent implements OnInit {
    @ViewChild('dt') dt!: Table; 
    users = signal<User[]>([]);
    userForm!: FormGroup; 
    isLoading = signal(false);
    showFormulaire = signal(false);

    sidebarVisible: boolean = true;

    constructor(
        private fb : FormBuilder,
        private userService : UserService, 
    ) { }

    ngOnInit(): void { 
        this.initForm();
        this.initData().then();
    }

    // Cette fonction initalise le formulaire
    initForm(): void {
        this.userForm = this.fb.group({
            id: [-1],
            nom: ["", Validators.required],
            prenom: ["", Validators.required],
            email: ["", Validators.required],
            password: ["", Validators.required],
            confirmPassword: ["", Validators.required],
        });
    }

    // Cette fonction repère tout les users du backend
    async initData() {
        this.isLoading.set(true);
        try {
            const usersData = await this.userService.getAll();
            console.log('Data from service:', usersData);
            if (Array.isArray(usersData)) {
                this.users.set(usersData);
            } else {
                console.error('Expected array but received:', usersData);
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.isLoading.set(false);
        }
    }
    

    // Cette fonction rempli le formulaire avec les données du user et l'affiche
    update(user: User) {
        this.userForm.patchValue(user);
        this.showFormulaire.set(true);
    }

    async save() {
        const formulaireData = this.userForm.value as User;
        this.isLoading.set(true);
        try {
            if (formulaireData.id === -1) {
                // ID = -1, c'est une création
                const savedUser = await this.userService.create(formulaireData);
                this.users.update(val => {
                    val.push(savedUser);
                    return val;
                });
            } else {
                // ID valide, c'est une mise à jour
                await this.userService.update(formulaireData);
                const userIndex = this.getUserIndexById(formulaireData.id);
                if (userIndex !== -1) {
                    this.users.update(val => {
                        val[userIndex] = formulaireData;
                        return val;
                    });
                }
            }
            this.closeForm();
        } catch (err) {
            console.log(err);
        } finally {
            this.isLoading.set(false);
        }
    }
    

 /*async deleteUser(userToDelete: User) {
        //this.isLoading.set(true);
        if(userToDelete.id == -1){
        try {
            
            await this.userService.delete(userToDelete.id);
            this.users.update(val => {  
                return val.filter(user => user.id!=userToDelete.id);
            });    
        } catch (error) {
            console.log(error);
        }finally{
            this.isLoading.set(false);
        }
    }
}*/

async deleteUser(userToDelete: User) {
    this.isLoading.set(true);
    try {
        //Attente de la suppression au backend
        await this.userService.delete(userToDelete.id);
        //suppression dans notre tableau
        this.users.update(val => {
            //cette fonction filtre et retourne tout les roles ou : role.id!=roleToDelete.id
            return val.filter(user => user.id!=userToDelete.id);
        });    
    } catch (error) {
        console.log(error);
    }finally{
        this.isLoading.set(false);
    }
}

   closeForm() {
        this.userForm.patchValue({
            id: -1,
            nom: "",
            prenom: "",
            email: "",
            password: "",
            confirmPassword: "",
        });
        this.showFormulaire.set(false);
    }  

    getUserIndexById(id: number) {
        //renvoit -1 si il ne trouve pas
        return this.users().findIndex(
            user => user.id == id
        );
    }

    onFilter(event: any) {
        const inputElement = event.target as HTMLInputElement;
        this.dt.filterGlobal(inputElement.value, 'contains');
    }
}
