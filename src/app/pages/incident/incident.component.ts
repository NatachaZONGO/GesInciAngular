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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SidebarModule } from 'primeng/sidebar';
import { Incident } from './incident.model';
import { TypeIncidentService } from '../type_incident/type_incident.service';
import { DropdownModule } from 'primeng/dropdown';
import { IncidentService } from './incident.service';



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
        ]
})
export class IncidentComponent implements OnInit {
@ViewChild ('dt') dt! : Table;  

    incidents = signal<Incident[]>([]);//liste de tout les incidents
    incidentForm!: FormGroup;//formulaire pour créer et update un incident
    isLoading = signal(false);//booléen pour afficher le loading
    showFormulaire = signal(false);//ce booléen indique si on doit afficher le formulaire
    
    visible: boolean = false;

    showInciDetails() {
        this.visible = true;
    }

    constructor(
        private fb: FormBuilder,
        private IncidentService: IncidentService, //service qui est charger de la communication avec l'api
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        
    ) {}

        ngOnInit(): void {
        this.initForm();
        this.initData().then();
    }

    /**
     * Cette fonction initalise le formulaire
     */
    initForm(): void{
        this.incidentForm = this.fb.group({
            //comme aucun incident normale n'a le id -1, en fesant cela ca me permet de savoir
            //si le formulaire contient les infos d'un rôle ou pas
            id: [-1],
            nom: ["", Validators.required],
            type_incident_id: ["", Validators.required],
            service_id: ["", Validators.required],
            description: ["", Validators.required],
            soumis_par: [""],
            date_soumission: [""],
            prise_en_charge_par: [""],
            date_prise_en_charge: [""],
            statut: [""],
            commentaire: [""],
        });
    }

    /**
     * Cette fonction récupère tout les incidents du backend
     */
    async initData(){
        this.isLoading.set(true);//permet d'afficher le loading
        try {
            this.incidents.set(
                await this.IncidentService.getAll() as Incident[]
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
        //remplissage
        this.incidentForm.patchValue({
            id: incident.id,
            nom: incident.nom,
            type_incident_id: incident.type_incident_id,
            service_id: incident.service_id,
            description: incident.description,
            soumis_par: incident.soumis_par,
            date_soumission: incident.date_soumission,
            prise_en_charge_par: incident.prise_en_charge_par,
            date_prise_en_charge: incident.date_prise_en_charge,
            statut: incident.statut,
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
        await this.IncidentService.delete(incidentToDelete.id);
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


}