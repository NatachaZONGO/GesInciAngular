import { AuthService } from './../../../auth/auth.service';
import { TypeIncident } from './../../type_incident/type_incident.model';
import { AllPrioriteIncident, Incident, IncidentStatut } from './../incident.model';
import { ServiceService } from './../../service/service.service';
import { IncidentService } from './../incident.service';
import { Component, effect, Input, input, OnInit, signal } from '@angular/core';
import { IncidentComponent } from '../incident.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DragDropModule } from 'primeng/dragdrop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TreeSelectModule } from 'primeng/treeselect';
import { DropdownModule } from 'primeng/dropdown';
import { Service } from '../../service/service.model';
import { TypeIncidentService } from '../../type_incident/type_incident.service';
import { SelectServiceComponent } from '../../service/select_service/select_service.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-incident.signaler',
    templateUrl: './incident.signaler.component.html',
    standalone: true,
    providers: [
      MessageService,
      ConfirmationService,
    ],
    imports: [
        IncidentComponent,
        FormsModule,
        DragDropModule,
        TableModule,
        ButtonModule,
        DialogModule,
        ReactiveFormsModule,
        FloatLabelModule,
        InputTextModule,
        InputTextareaModule,
        ToastModule,
        ConfirmPopupModule,
        TreeSelectModule,
        DropdownModule,
        SelectServiceComponent
    ],

})
export class IncidentSignalerComponent implements OnInit {
    formulaireIncident!: FormGroup;
    //typesIncidents = [];
    services: { label: string, value: number }[] = [];
    typesIncidents: {id: number, nom: string}[] = [];
    priorites = [
      AllPrioriteIncident.FAIBLE,
      AllPrioriteIncident.MOYENNE,
      AllPrioriteIncident.FORTE,
    ];
    isLoading = false;
    service = signal<Service|undefined>(undefined);
    id: number|undefined;

  constructor(
    private fb: FormBuilder, 
    private incidentService: IncidentService ,
    private serviceService: ServiceService,
    private typeIncidentService: TypeIncidentService,
    private messageService: MessageService,
    private avtivatedRoute: ActivatedRoute,
    private authService: AuthService,
    
) {}

  ngOnInit() {    
    this.formulaireIncident = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(255)]],
      type_incident_id: ['', [Validators.required]],
      service_id: ['', [Validators.required]],
      //priorite: ['', [Validators.required]],
    });
    this.isLoading = true;
    this.id = this.avtivatedRoute.snapshot.params['id'] as number|undefined;
    this.init(this.id).catch((error) => {
      console.error('Erreur lors du chargement des départements', error);
  }).finally(() => {
    this.isLoading = false;
  });
}

async init(id: number|undefined) {
  if(id){
    const incident = await this.incidentService.getIncidentSpecifique(id);
    this.formulaireIncident.patchValue(
      {
        "nom": incident.nom,
        "description": incident.description,
        "type_incident_id": incident.type_incident.id,
        "service_id": incident.service?.id
      }
    );
    this.service.set(incident.service);
  }
  this.typesIncidents = await this.typeIncidentService.getAll();

}
    

//fonction pour enregistrer l'incident signale
  async save() {
    const formulaireData = this.formulaireIncident.value as Incident;
    console.log(formulaireData);
    
    this.isLoading = true;
    try {
      if(this.id == undefined){
        const incident = {
          nom: formulaireData.nom,
          description: formulaireData.description,
          type_incident_id:formulaireData.type_incident_id,
          //priorite: formulaireData.priorite,
          service_id: this.service()?.id as number,
          statut: 'cree',
      };
        const savedIncident = await this.incidentService.create(incident);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Incident enregistr  avec succ s', life: 3000 });
      }else{
        await this.incidentService.update(this.id, formulaireData); 
        const savedIncident = await this.incidentService.getIncidentSpecifique(this.id);
        this.service.update(currentService => {
          if (savedIncident.service) {
            return savedIncident.service;
          }
          return currentService;
        }); 
        //const savedIncident = await this.incidentService.update(this.id, incident);
      }
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Incident enregistr  avec succ s', life: 3000 });
      this.formulaireIncident.reset();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'incident', error);
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'enregistrement de l\'incident', life: 3000 });
      }

    this.isLoading = false;
  }

}

  