import { Service } from './../service/service.model';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingComponent } from '../../Share/loading/loading.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SidebarModule } from 'primeng/sidebar';
import { AllPrioriteIncident, AllStatutsIncident, Incident } from './incident.model';
import { TypeIncidentService } from '../type_incident/type_incident.service';
import { DropdownModule } from 'primeng/dropdown';
import { IncidentService } from './incident.service';
import { UserSelectorComponent } from '../user/user_selector/user_selector.component';
import { User } from '../user/user.model';
import { ActivatedRoute } from '@angular/router';
import { SplitButton, SplitButtonModule } from 'primeng/splitbutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';



@Component({
    standalone: true,
    selector: 'app-incident',
    templateUrl: './incident.component.html',
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
        ToastModule,
        ConfirmPopupModule,
        DropdownModule,
        UserSelectorComponent,
        SplitButtonModule,
        RadioButtonModule,
        CommonModule,
        ]
})
export class IncidentComponent implements OnInit {
@ViewChild ('dt') dt! : Table;  

    
    incidents = signal<Incident[]>([]);//liste de tout les incidents
    incidentForm!: FormGroup;//formulaire pour créer et update un incident
    isLoading = signal(false);//booléen pour afficher le loading
    showFormulaire = signal(false);//ce booléen indique si on \doit afficher le formulaire
    selectedIncident = signal<Incident|undefined>(undefined)

    
    incidentId!: number;  // ID de l'incident à commenter
    showInciDetailsDialog = signal<boolean>(false);
    showSelectUserDialog = signal<boolean>(false);

    visible: boolean = false;
    visiblePriorite: boolean = false;
    visibleStatut: boolean = false;
    prioriteIncident = AllPrioriteIncident;
    statutIncident = AllStatutsIncident;


    showInciDetails(incident: Incident) {
        this.selectedIncident.set(incident);
        this.showInciDetailsDialog.set(true);
    }

    selectUser(incident: Incident){
        this.selectedIncident.set(incident);
        this.showSelectUserDialog.set(true);
    }

    showCommentDialog() {
        this.visible = true;
    }

    showPrioriteDialog(incident: Incident) {
        this.selectedIncident.set(incident); // On s'assure de définir l'incident sélectionné
        this.incidentId = incident.id; // Assigne l'ID de l'incident sélectionné
        this.visiblePriorite = true;this.visiblePriorite = true;
    }

    showStatutDialog(incident: Incident) {
        this.selectedIncident.set(incident); // On s'assure de définir l'incident sélectionné
        this.incidentId = incident.id; // Assigne l'ID de l'incident sélectionné
        this.visibleStatut = true;
    }

    constructor(
        private fb: FormBuilder,
        private incidentService: IncidentService, //service qui est charger de la communication avec l'api
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute,
        
    ) {}

      ngOnInit(): void {
        this.initData().then();
        this.incidentForm = this.fb.group({
            statut: ['', Validators.required],
            priorite: ['', Validators.required],
            commentaire: ['', Validators.required]  // Champ pour le commentaire
          });
          
    }
    
    /**
     * Cette fonction récupère tout les incidents du backend
     */
    async initData(){
        this.isLoading.set(true);//permet d'afficher le loading
        try {
            this.incidents.set(
                await this.incidentService.getAll() as Incident[]
            );
        } catch (error) {
            console.log(error);
        }finally{ //Code toujours exécuter même si y a erreur
            this.isLoading.set(false);
        }
    }

    /**
     * Cette fonction rempli le formulaire avec les données du rôle
     * et l'affiche
     * @param incident 
     */
    update(incident: Incident){
        this.incidentId = incident.id;
         console.log('Incident ID:', this.incidentId); 
        //remplissage
        this.incidentForm.patchValue({
            priorite: incident.priorite,
            commentaires: incident.commentaires
        });
        //déclenchement de l'affichage du formulaire
        this.showFormulaire.set(true);
    }

    /**
     * Fonction chargée de la création et de la mise à jour du formulaire
     */

async deleteIncident(incidentToDelete: Incident){
    this.isLoading.set(true);
    try {
        //Attente de la suppression au backend
        await this.incidentService.delete(incidentToDelete.id);
        //suppression dans notre tableau
        this.incidents.update(val => {
            //cette fonction filtre et retourne tout les incidents ou : incident.id!=incidentToDelete.id
            return val.filter(incident => incident.id!=incidentToDelete.id);
        }); 
        this.messageService.add({severity:'success', summary: 'Succès', detail: 'Incident supprimé avec succès', life: 3000});   
    } catch (error) {
        console.log(error);
        this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Une erreur est survenue', life: 3000});
    }finally{
        this.isLoading.set(false);
    }
}
    /**
     * Cette fonction remet le formulaire a son état initiale et le ferme
     */
    closeForm(){
        this.incidentForm.patchValue({
            id: -1,
            nom: "",
            type_incident_id:"",
            service_id: "",
            description: "",
            soumis_par: "",
            date_soumission: "",
            prise_en_charge_par: "",
            date_prise_en_charge: "",
            statut: "",
            priorite: "",
            commentaire: "",
        });
        this.showFormulaire.set(false);
    }

    /**
     * Cette fonction renvoit l'index du incident dont l'id est en
     * paramètre. Il cherche dans le tableau de tout les rôles
     * S'il ne trouve pas, il rnevoit -1
     * @param id 
     * @returns 
     */
    getincidentIndexById(id: number): number{
        //renvoit -1 si il ne trouve pas
        return this.incidents().findIndex(
            incident => incident.id == id
        );
    }

    

    onFilter(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.dt.filterGlobal(inputElement.value, 'contains');
    }

    confirmDelete(event: Event ,incidentToDelete: Incident) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Etes-vous sûr de vouloir supprimer ce incident ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteIncident(incidentToDelete);
            },     
        });
    }
    async onUserSelected(user: User){
        console.log("onUserSelected");
        //await this.IncidentService.affecter(user, this.selectedIncident());
        const incident = this.selectedIncident(); // Récupère l'incident sélectionné
        if (incident) {
            try {
                const response = await this.incidentService.affecter(user.id, incident.id);
                console.log('Affectation effectué' ,response);
                this.messageService.add({severity:'success', summary: 'Succès', detail: 'Incident affecté avec succès', life: 3000});
                
            } catch (error) {
                console.log(error);
            }
        }    
        console.log(event);
    }

    //Composant pour ajouter un commentaire d'un incident mettre dans le champ commentaire d'un incident

   // Méthode pour enregistrer le commentaire
   saveComment() {
    if (this.incidentForm.valid && this.incidentId) {
      const commentaire = this.incidentForm.get('commentaire')?.value;
      console.log('Incident ID:', this.incidentId);
      console.log('Commentaire:', commentaire);
      // Appel à l'API pour mettre à jour le commentaire
      this.incidentService.addComment(this.incidentId, commentaire).then(response => {
        console.log('Commentaire ajouté avec succès:', response);
        this.visible = false;  // Ferme la boîte de dialogue após la soumission
      }).catch(error => {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
      });
    } else {
      console.log('Formulaire invalide ou ID d\'incident manquant');
    }
  } 


  async updateIncident(id: number) {
    try {
        const incident = await this.incidentService.getIncidentById(id);
        if (incident) {
            this.incidentId = incident.id;  // Assigner l'ID
            this.incidentForm.patchValue({
                priorite: incident.priorite,
                commentaire: incident.commentaire
            });
            this.showFormulaire.set(true);
        } else {
            console.error('Incident non trouvé pour l\'ID:', id);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'incident:', error);
    }

}

  /**
     * Fonction pour sauvegarder la priorité
     */
  async savePriorite() {
    console.log('Incident ID:', this.incidentId);
    console.log('Priorité:', this.incidentForm.get('priorite')?.value);
    if (this.incidentForm.get('priorite')?.valid && this.incidentId) {
        const priorite = this.incidentForm.get('priorite')?.value;
        try {
            await this.incidentService.updatePriority(this.incidentId, priorite); // Utilise l'ID de l'incident pour la mise à jour
            this.messageService.add({severity:'success', summary: 'Succès', detail: 'Priorité mise à jour avec succès', life: 3000});
            this.visiblePriorite = false; // Ferme le dialogue après la mise à jour
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la priorité:', error);
            this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Une erreur est survenue', life: 3000});
        }
    } else {
        console.log('Formulaire invalide ou ID d\'incident manquant');
    }
    
}

async saveStatut() {
    console.log('Incident ID:', this.incidentId);
    console.log('Statut:', this.incidentForm.get('statut')?.value);
    if (this.incidentForm.get('statut')?.valid && this.incidentId) {
        const statut = this.incidentForm.get('statut')?.value;
        try {
            await this.incidentService.updateStatut(this.incidentId, statut); // Utilise l'ID de l'incident pour la mise à jour
            this.messageService.add({severity:'success', summary: 'Succès', detail: 'Statut mis à jour avec succès', life: 3000});
            this.visibleStatut = false; // Ferme le dialogue après la mise à jour
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Une erreur est survenue', life: 3000});
        }
    } else {
        console.log('Formulaire invalide ou ID d\'incident manquant');
    }

}
  
}