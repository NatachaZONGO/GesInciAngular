import { Service } from './../service.model';
import { Component, model, NgModule, OnInit, signal } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DepartementComponent } from '../../departement/departement.component';
import { DepartementService } from '../../departement/departement.service';
import { Departement } from '../../departement/departement.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-select-service',
    templateUrl: './select_service.component.html',
    standalone: true,
    imports: [
        FormsModule,
        DropdownModule,
        InputTextModule,
    ],
})
export class SelectServiceComponent implements OnInit {
    //service = model.required<Service>();
    service = model.required<Service|undefined>();
    departements=signal<{ label: string, value: Departement }[]>([]);
    services=signal<{ label: string, value: Service }[]>([]);
    isLoading =signal(false);
    selectedDepartement = signal<Departement|undefined>(undefined);


    constructor(
        private departementService: DepartementService,
    ) { }

    ngOnInit(): void { 
        this.initData().then(r => console.log(r));
    }

//fonction pour charger les données de departements avec les services
    async initData() {
        this.isLoading.set(true)
        try {
            const dep = await this.departementService.getDepartementsWithServices();
            this.departements.set( dep.map(departement => ({
                label: departement.nom, 
                value: departement })));
                console.log(this.departements());
                
        } catch (error) {
            console.log(error)
        } finally {
            this.isLoading.set(false)
        }
    }

    
    onDepartementChange(){
        console.log(this.selectedDepartement());
           const servicedep= this.selectedDepartement()?.services.map(service => ({label: service.nom, value: service})) || [];
            this.services.set (servicedep);
    }
    //fonction pour recuperer les service du departement selectionne et les mettre dans la constante selectedDepartement puis dans la dropdown services
    

}
