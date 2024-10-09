import { Service } from '../service/service.model';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingComponent } from '../../Share/loading/loading.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SidebarModule } from 'primeng/sidebar';
import { AllPrioriteIncident, AllStatutsIncident, Incident } from './mesIncident.model';
import { TypeIncidentService } from '../type_incident/type_incident.service';
import { DropdownModule } from 'primeng/dropdown';
import { IncidentService } from './mesIncident.service';
import { UserSelectorComponent } from '../user/user_selector/user_selector.component';
import { User } from '../user/user.model';
import { ActivatedRoute } from '@angular/router';
import { SplitButton, SplitButtonModule } from 'primeng/splitbutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CanSeeDirective } from '../../Share/can_see/can_see.directive';


@Component({
    standalone: true,
    selector: 'app-mesincident',
    templateUrl: './mesIncident.component.html',
    styleUrls: ['./mesIncident.component.scss'],
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
        FormsModule,
        BadgeModule,
        InputGroupModule,
        InputGroupAddonModule,
        CanSeeDirective
        ]
})
export class MesIncidentComponent implements OnInit {
@ViewChild ('dt') dt! : Table;  

    
    incidents = signal<Incident[]>([]);//liste de tout les incidents
    isLoading = signal(false);//booléen pour afficher le loading
    selectedIncident = signal<Incident|undefined>(undefined);
    commentaireInput = signal<string>('');
    showInciDetailsDialog = signal<boolean>(false);
    showSelectUserDialog = signal<boolean>(false);
    visibleCommentDialog: boolean = false;
    visiblePriorite: boolean = false;
    visibleStatut: boolean = false;
    prioriteIncident = signal<string>("");
    statusIncident = signal<string>("");
    selectedStatut = signal<string | null>(null);
    selectedPriorite = signal<string | null>(null);

    

    allPriorite = [AllPrioriteIncident.FAIBLE, AllPrioriteIncident.MOYENNE, AllPrioriteIncident.FORTE];
    allStatus = [AllStatutsIncident.FAIBLE, AllStatutsIncident.MOYENNE, AllStatutsIncident.FORTE];

    filteredIncidents: Incident[] = []; // Liste filtrée



    statutOptions = [
        { label: 'En cours', value: AllStatutsIncident.FAIBLE.value },
        { label: 'Traite', value: AllStatutsIncident.MOYENNE.value },
        { label: 'Cree', value: AllStatutsIncident.FORTE.value }
    ];
    
    prioriteOptions = [
        { label: 'Faible', value: AllPrioriteIncident.FAIBLE.value },
        { label: 'Moyenne', value: AllPrioriteIncident.MOYENNE.value },
        { label: 'Forte', value: AllPrioriteIncident.FORTE.value }
    ];


    showInciDetails(incident: Incident) {
        this.selectedIncident.set(incident);
        this.showInciDetailsDialog.set(true);
    }

    selectUser(incident: Incident){
        this.selectedIncident.set(incident);
        this.showSelectUserDialog.set(true);
    }

    showCommentDialog(incident: Incident) {
        this.selectedIncident.set(incident);
        this.commentaireInput.set(incident.commentaires);
        this.visibleCommentDialog = true;
    }

    showPrioriteDialog(incident: Incident) {
        this.selectedIncident.set(incident); // On s'assure de définir l'incident sélectionné
        this.prioriteIncident.set(incident.priorite);
        this.visiblePriorite = true;this.visiblePriorite = true;
    }

    showStatutDialog(incident: Incident) {
        this.selectedIncident.set(incident); // On s'assure de définir l'incident sélectionné
        this.statusIncident.set(incident.statut)
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
        
    }
    
    /**
     * Cette fonction récupère tout les incidents du backend
     */
    async initData() {
        this.isLoading.set(true);
        try {
            const allIncidents = await this.incidentService.getAll() as Incident[];
            this.incidents.set(allIncidents);
            this.filteredIncidents = allIncidents; // Initialise les incidents filtrés
        } catch (error) {
            console.log(error);
        } finally {
            this.isLoading.set(false);
        }
    }
    

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
            acceptLabel: 'Oui', // Modifier le bouton "Yes" en "Oui"
            rejectLabel: 'Non', 
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
    async saveComment() {
        this.isLoading.set(true);
        if(this.commentaireInput().trim().length==0) return;
        try {
            await this.incidentService.addComment(this.selectedIncident()?.id??-1, this.commentaireInput());
            this.selectedIncident.update(inci => {
                if(inci){
                    inci.commentaires = this.commentaireInput();
                    inci.statut = 'traite';
                }
                return inci;
            });
            this.visibleCommentDialog = false;
        } catch (error) {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
        }finally{
            this.isLoading.set(false);
        }
  } 

    /**
   * Fonction pour sauvegarder la priorité
   */
    async savePriorite() {
        if(this.prioriteIncident().trim().length==0) return;
        this.isLoading.set(true);
        try {
            await this.incidentService.updatePriority(this.selectedIncident()?.id??0, this.prioriteIncident());
            this.selectedIncident.update(inci =>{
                if(inci){
                    inci.priorite = this.prioriteIncident();
                }
                return inci;
            });
            this.visiblePriorite = false;
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Priorité mise à jour avec succès', life: 3000 });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la priorité:', error);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue lors de la mise à jour de la priorité', life: 3000 });
        }finally{
            this.isLoading.set(false);
        }
      }
    

async saveStatut() {
    if(this.statusIncident().trim().length==0) return;
        this.isLoading.set(true);
        try {
            await this.incidentService.updateStatut(this.selectedIncident()?.id??0, this.statusIncident());
            this.selectedIncident.update(inci =>{
                if(inci){
                    inci.statut = this.statusIncident();
                }
                return inci;
            });
            this.visibleStatut = false;
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Statut mise à jour avec succès', life: 3000 });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue lors de la mise à jour du statut', life: 3000 });
        }finally{
            this.isLoading.set(false);
        }
    }

    filterByStatut(statut: string) {
        if (statut) {
            this.filteredIncidents = this.incidents().filter(incident => incident.statut === statut);
        } else {
            this.filteredIncidents = this.incidents(); // Afficher tous les incidents si aucun statut n'est sélectionné
        }
    }

    filterByPriorite(priorite: string) {
        if (priorite) {
            this.filteredIncidents = this.incidents().filter(incident => incident.priorite === priorite);
        } else {
            this.filteredIncidents = this.incidents(); // Afficher tous les incidents si aucun statut n'est sélectionné
        }
    }
    
}