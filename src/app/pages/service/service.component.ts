import { Departement } from './../departement/departement.model';
import { Component, NgModule, OnInit, signal, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingComponent } from '../../Share/loading/loading.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SidebarModule } from 'primeng/sidebar';
import { ServiceService } from './service.service';
import { Service } from './service.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { DepartementService } from '../departement/departement.service';
import { DropdownModule } from 'primeng/dropdown';



@Component({
    standalone: true,
    selector: 'app-service',
    templateUrl: './service.component.html',
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
        FormsModule,
        MultiSelectModule,
        DropdownModule
        ]
})
export class ServiceComponent implements OnInit {
@ViewChild ('dt') dt! : Table;  

    services = signal<Service[]>([]);//liste de tout les services
    serviceForm!: FormGroup;//formulaire pour créer et update un service
    isLoading = signal(false);//booléen pour afficher le loading
    showFormulaire = signal(false);//ce booléen indique si on doit afficher le formulaire
    
    selectedDepartement!: Departement;
    departements: { id: number, nom: string }[] = []


    constructor(
        private fb: FormBuilder,
        private ServiceService: ServiceService, //service qui est charger de la communication avec l'api
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private departementService: DepartementService,


    ) {
       
     }

    

     ngOnInit(): void {
        this.initForm();
        this.initData().then();
        
        // Chargement des départements depuis l'API
        this.departementService.getAll().then((res) => {
            console.log('Departements:', res);
            if (res && Array.isArray(res)) {
                this.departements = res; // Assigner les départements si les données sont valides
            } else {
                this.departements = []; // Gérer une réponse vide ou invalide
                this.messageService.add({severity: 'warn', summary: 'Attention', detail: 'Aucun département trouvé', life: 3000});
            }
        }).catch((error) => {
            console.error('Erreur lors du chargement des départements', error);
            this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les départements', life: 3000});
        });
    }

    /**
     * Cette fonction initalise le formulaire
     */
    initForm(): void{
        this.serviceForm = this.fb.group({
            //comme aucun service normale n'a le id -1, en fesant cela ca me permet de savoir
            //si le formulaire contient les infos d'un rôle ou pas
            id: [-1],
            nom: ["", Validators.required],
            departement: [null, Validators.required],
            description: ["", Validators.required],
            
        });
    }

    /**
     * Cette fonction récupère tout les services du backend
     */
    async initData(){
        this.isLoading.set(true);//permet d'afficher le loading
        try {
            this.services.set(
                await this.ServiceService.getAll()
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
     * @param service 
     */
    update(service: Service){
        //remplissage
        this.serviceForm.patchValue({
            id: service.id,
            nom: service.nom,
            description: service.description,
            departement: service.departement
        });
        //déclenchement de l'affichage du formulaire
        this.showFormulaire.set(true);
    }

    /**
     * Fonction chargée de la création et de la mise à jour du formulaire
     */
    async save() {
        const formulaireData = this.serviceForm.value as Service;
        this.isLoading.set(true);
        
        try {
            // Conversion de l'ID du département en entier
            //formulaireData.departement = Number(this.serviceForm.get('departement_id')?.value);
            const service: Service = {
                id: -1,
                nom: formulaireData.nom,
                departement_id: formulaireData.departement.id,
                description: formulaireData.description,
                departement: formulaireData.departement,
            };
            /* Si id = -1, alors le formulaire ne contient pas les infos d'un service. 
             * Donc c'est une création
             */
            if (formulaireData.id == -1) {
                // si c'est -1 alors on veut faire un ajout
                // On attend l'ajout au backend
                const savedservice = await this.ServiceService.create(service);
                service.id = savedservice.id;
                // on met à jour le tableau
                this.services.update((val) => {
                    // on ajoute le nouveau service
                    val.push(service);
                    return val;
                });
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Service ajouté avec succès',
                    life: 3000
                });
            } else {
                /* Dans ce cas, le formulaire contient les données d'un service,
                 * alors on tente de le mettre à jour
                 */
                service.id = formulaireData.id;
                await this.ServiceService.update(service);
                // on récupère l'index du service modifié dans le tableau de tous les services
                const serviceIndex = this.getserviceIndexById(formulaireData.id);
                if (serviceIndex != -1) {
                    // service trouvé dans le tableau
                    this.services.update((val) => {
                        // on met à jour le service à cet index
                        val[serviceIndex].nom= formulaireData.nom;
                        val[serviceIndex].departement_id= formulaireData.departement.id;
                        val[serviceIndex].description= formulaireData.description;
                        val[serviceIndex].departement= formulaireData.departement;
                        return val;
                    });
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Service mis à jour avec succès',
                        life: 3000
                    });
                }
            }
            // on ferme le formulaire
            this.closeForm();
        } catch (err) {
            console.log(err);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Une erreur est survenue',
                life: 3000
            });
        } finally {
            this.isLoading.set(false);
        }
    }
    

    /**
     * Cette fonction supprime un rôle
     * @param serviceToDelete 
     */
    async deleteService(serviceToDelete: Service){
        this.isLoading.set(true);
        try {
            //Attente de la suppression au backend
            await this.ServiceService.delete(serviceToDelete.id);
            //suppression dans notre tableau
            this.services.update(val => {
                //cette fonction filtre et retourne tout les services ou : service.id!=serviceToDelete.id
                return val.filter(service => service.id!=serviceToDelete.id);
            }); 
            this.messageService.add({severity:'success', summary: 'Succès', detail: 'service supprimé avec succès', life: 3000});   
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
        this.serviceForm.patchValue({
            id: -1,
            nom: "",
            departement: null,
            description: ""
        });
        this.showFormulaire.set(false);
    }

    /**
     * Cette fonction renvoit l'index du service dont l'id est en
     * paramètre. Il cherche dans le tableau de tout les rôles
     * S'il ne trouve pas, il rnevoit -1
     * @param id 
     * @returns 
     */
    getserviceIndexById(id: number): number{
        //renvoit -1 si il ne trouve pas
        return this.services().findIndex(
            service => service.id == id
        );
    }

    onFilter(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.dt.filterGlobal(inputElement.value, 'contains');
    }

    confirmDelete(event: Event ,serviceToDelete: Service) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Etes-vous sûr de vouloir supprimer ce service ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non', 
            accept: () => {
                this.deleteService(serviceToDelete);
            },
            
        });
    }

}