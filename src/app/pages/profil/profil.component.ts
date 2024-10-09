import { ToastModule } from 'primeng/toast';
import { Component, OnInit, signal } from '@angular/core';
import { UserService } from '../user/user.service';
import { User } from '../user/user.model';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports:[
    CommonModule,
    ButtonModule,
    FloatLabelModule,
    ReactiveFormsModule,
    DialogModule,
    ToastModule,
    ConfirmPopupModule,
    FormsModule,

  ],
})
export class ProfilComponent implements OnInit {
  user: User | null = null; // Initialisation à null
  roles: any[] = []; 
  users = signal<User[]>([]);
    userForm!: FormGroup; 
    isLoading = signal(false);
    showFormulaire = signal(false);
  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private messageService: MessageService,
    private fb : FormBuilder,
    private confirmationService : ConfirmationService,
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  getCurrentUserId(): number | null {
    const user = localStorage.getItem('utilisateur');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.id; // Assurez-vous que l'objet utilisateur a bien la propriété id
    }
    return null;
  }
  loadUserProfile(): void {
    const userId = this.getCurrentUserId(); 
    if (userId) {
        this.authService.getCurrentUserInfos(userId).subscribe(
            (response) => {
                console.log('Données utilisateur récupérées:', response); // Vérifiez la réponse ici
                this.user = response.user; // Assignez l'utilisateur
                this.roles = response.roles; // Assignez les rôles
            },
            (error) => {
                console.error('Erreur lors de la récupération des informations de l\'utilisateur', error);
            }
        );
    } else {
        console.warn('Aucun utilisateur connecté');
    }
}

// Cette fonction initialise le formulaire sans la partie ajout
initForm(): void {
  this.userForm = this.fb.group({
      id: [null], // On peut garder l'id ici pour une mise à jour
      nom: ["", Validators.required],
      prenom: ["", Validators.required],
      email: ["", Validators.required],
      password: [""], // Optionnel pour mise à jour
      confirmPassword: [""], // Optionnel pour mise à jour
  });
}

// Cette fonction remplit le formulaire avec les données de l'utilisateur et l'affiche
openDialog(user: User) {
  this.userForm.patchValue(user); // Remplit le formulaire avec les données de l'utilisateur
  this.showFormulaire.set(true); // Affiche le dialogue
}


// Méthode pour sauvegarder (mettre à jour)
async save() {
  const formulaireData = this.userForm.value as User;
  this.isLoading.set(true);
  try {
      // On suppose qu'il faut avoir un ID valide pour mettre à jour
      if (formulaireData.id != null) {
          // ID valide, c'est une mise à jour
          await this.userService.update(formulaireData);
          const userIndex = this.getUserIndexById(formulaireData.id);
          if (userIndex !== -1) {
              this.users.update(val => {
                  val[userIndex] = formulaireData;
                  return val;
              });
          } else {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur mis à jour avec succès', life: 3000 });
          }
      }
      this.closeForm();
  } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue', life: 3000 });
  } finally {
      this.isLoading.set(false);
  }
}

// Méthode pour fermer le formulaire
closeForm() {
  this.userForm.reset(); // Réinitialise le formulaire
  this.showFormulaire.set(false);
}

// Méthode pour obtenir l'index de l'utilisateur par ID
getUserIndexById(id: number) {
  // Renvoie -1 si l'utilisateur n'est pas trouvé
  return this.users().findIndex(
      user => user.id == id
  );
}

}
