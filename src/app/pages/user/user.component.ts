import { ToastModule } from 'primeng/toast';
import { RoleService } from './../role/role.service';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { RoleComponent } from '../role/role.component';
import { Role } from '../role/role.model';
import { CheckboxModule } from 'primeng/checkbox';
import { RoleUserComponent } from './role_user/role_user.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: true,
    providers: [
        MessageService,
        ConfirmationService,
    ],
    imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    LoadingComponent,
    FloatLabelModule,
    InputTextModule,
    InputTextareaModule,
    FormsModule,
    SidebarModule,
    RoleUserComponent,
    ToastModule,
    ConfirmPopupModule,
]
})
export class UserComponent implements OnInit {
    @ViewChild('dt') dt!: Table; 
    users = signal<User[]>([]);
    userForm!: FormGroup; 
    isLoading = signal(false);
    showFormulaire = signal(false);
    showRoleSidebar = signal(false);
    selectedUser = signal<User|undefined>(undefined);
    

    constructor(
        private fb : FormBuilder,
        private userService : UserService, 
        private roleService : RoleService,
        private messageService : MessageService,
        private confirmationService : ConfirmationService,
        
    ) { }

    ngOnInit(): void { 
        this.initForm();
        this.initData().then();
          
    }

    openRoleSideBar(user: User) {
        this.selectedUser.set(user);
        this.showRoleSidebar.set(true);
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
            const usersData = await this.userService.getAllWithRoles();
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
                this.messageService.add({severity:'success', summary: 'Succès', detail: 'Utilisateur ajouté avec succès', life: 3000});
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
            this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Une erreur est survenue', life: 3000});
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
        this.messageService.add({severity:'success', summary: 'Succès', detail: 'Utilisateur supprimé avec succès', life: 3000});
    } catch (error) {
        console.log(error);
        this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Une erreur est survenue', life: 3000});
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

    async onUserRoleEdit(event: number[]){
        this.isLoading.set(true);
        try {
            const userId = 
            await this.userService.attachDetachRole(this.selectedUser()!.id, event);
            this.showRoleSidebar.set(false);

        } catch (error) {
            
        }finally{
            this.isLoading.set(false);
        }
    }

    confirmDelete(event: Event ,userToDelete: User) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Etes-vous sûr de vouloir supprimer cet utilisateur ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteUser(userToDelete);
            },
            
        });
    }

}
