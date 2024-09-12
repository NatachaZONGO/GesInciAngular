import { TypeIncident } from './../../type_incident/type_incident.model';
import { AllPrioriteIncident, Incident, IncidentStatut } from './../incident.model';
import { ServiceService } from './../../service/service.service';
import { IncidentService } from './../incident.service';
import { Component, OnInit, signal } from '@angular/core';
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


  constructor(
    private fb: FormBuilder, 
    private incidentService: IncidentService ,
    private serviceService: ServiceService,
    private typeIncidentService: TypeIncidentService,
    private messageService: MessageService,

) {}

  ngOnInit() {
    this.formulaireIncident = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(255)]],
      type_incident_id: ['', [Validators.required]],
      //priorite: ['', [Validators.required]],
    });

    // Chargement des types incident depuis l'API
    this.typeIncidentService.getAll().then((res) => {
      console.log('Type incidents:', res);
      if (res && Array.isArray(res)) {
          this.typesIncidents = res; // Assigner les départements si les données sont valides
      } else {
          this.typesIncidents = []; 
      }
  }).catch((error) => {
      console.error('Erreur lors du chargement des départements', error);
  });
}
    

//fonction pour enregistrer l'incident signale
  async save() {
    const formulaireData = this.formulaireIncident.value as Incident;
    console.log(formulaireData);
    
    this.isLoading = true;
    try {
      const incident = {
          nom: formulaireData.nom,
          description: formulaireData.description,
          type_incident_id:formulaireData.type_incident_id,
          //priorite: formulaireData.priorite,
          service_id: this.service()?.id as number,
      };
      const savedIncident = await this.incidentService.create(incident);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Incident enregistr  avec succ s', life: 3000 });
      this.formulaireIncident.reset();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'incident', error);
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'enregistrement de l\'incident', life: 3000 });
      }

    this.isLoading = false;
  }
 
  }

  