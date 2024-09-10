import { Component, OnInit, signal, Type, ViewChild } from '@angular/core';
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
import { TypeIncident } from './type_incident.model';
import { TypeIncidentService } from './type_incident.service';



@Component({
    standalone: true,
    selector: 'app-type_incident',
    templateUrl: './type_incident.component.html',
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
        ConfirmPopupModule
        ]
})
export class TypeIncidentComponent implements OnInit {
@ViewChild ('dt') dt! : Table;  

    typeIncidents = signal<TypeIncident[]>([]);//liste de tout les typeIncidents
    typeIncidentForm!: FormGroup;//formulaire pour créer et update un typeIncident
    isLoading = signal(false);//booléen pour afficher le loading
    showFormulaire = signal(false);//ce booléen indique si on doit afficher le formulaire

    constructor(
        private fb: FormBuilder,
        private TypeIncidentService: TypeIncidentService, //service qui est charger de la communication avec l'api
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
    ) { }

    

        ngOnInit(): void {
        this.initForm();
        this.initData().then();
    }

    /**
     * Cette fonction initalise le formulaire
     */
    initForm(): void{
        this.typeIncidentForm = this.fb.group({
            //comme aucun typeIncident normale n'a le id -1, en fesant cela ca me permet de savoir
            //si le formulaire contient les infos d'un rôle ou pas
            id: [-1],
            nom: ["", Validators.required],
            description: ["", Validators.required]
        });
    }

    /**
     * Cette fonction récupère tout les typeIncidents du backend
     */
    async initData(){
        this.isLoading.set(true);//permet d'afficher le loading
        try {
            this.typeIncidents.set(
                await this.TypeIncidentService.getAll()
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
     * @param typeIncident 
     */
    update(typeIncident: TypeIncident){
        //remplissage
        this.typeIncidentForm.patchValue({
            id: typeIncident.id,
            nom: typeIncident.nom,
            description: typeIncident.description
        });
        //déclenchement de l'affichage du formulaire
        this.showFormulaire.set(true);
    }

    /**
     * Fonction chargée de la création et de la mise à jour du formulaire
     */
    async save(){
        const formulaireData = this.typeIncidentForm.value as TypeIncident;
        this.isLoading.set(true);
        try{
            /*Si id=-1 alors le formulaire ne contient pas les infos d'un typeIncident.
            **Donc c'est une création
            */
            if(formulaireData.id == -1){
                //si c'est -1 alors on veut faire un ajout
                //On attend l'ajout au backend
                const savedTypeIncident = await this.TypeIncidentService.create(formulaireData);
                //on met à jour le tableau
                this.typeIncidents.update((val)=>{
                    //on ajoute le nouveau typeIncident
                    val.push(savedTypeIncident);
                    return val;
                });
                this.messageService.add({severity:'success', summary: 'Succès', detail: 'typeIncident ajouté avec succès', life: 3000});
            }else
            /*Dans ce cas le formulaire contient les données d'un typeIncident
            **alors on tente de le mettre à jour
            **/
            {
                //s'il y a un id valide alors c'est un update
                //on attend la mise
                await this.TypeIncidentService.update(formulaireData);
                //on récupère l'index du typeIncident modifié dans le tableau de tout les typeIncidents
                const typeIncidentIndex = this.gettypeIncidentIndexById(formulaireData.id);
                if(typeIncidentIndex!=-1){
                    //typeIncident trouvé dans le tableau
                    this.typeIncidents.update(val => {
                        //on met à jour le typeIncident à cet index
                        val[typeIncidentIndex] = formulaireData;
                        return val;
                    });
                    this.messageService.add({severity:'success', summary: 'Succès', detail: 'typeIncident mis à jour avec succès', life: 3000});
                }
            }
            //on ferme le formulaire
            this.closeForm();
        } catch(err) {
            console.log(err); 
            this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Une erreur est survenue', life: 3000});
        }finally{
            this.isLoading.set(false);
        }
    }

    /**
     * Cette fonction supprime un rôle
     * @param typeIncidentToDelete 
     */
    async deletetypeIncident(typeIncidentToDelete: TypeIncident){
        this.isLoading.set(true);
        try {
            //Attente de la suppression au backend
            await this.TypeIncidentService.delete(typeIncidentToDelete.id);
            //suppression dans notre tableau
            this.typeIncidents.update(val => {
                //cette fonction filtre et retourne tout les typeIncidents ou : typeIncident.id!=typeIncidentToDelete.id
                return val.filter(typeIncident => typeIncident.id!=typeIncidentToDelete.id);
            }); 
            this.messageService.add({severity:'success', summary: 'Succès', detail: 'typeIncident supprimé avec succès', life: 3000});   
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
        this.typeIncidentForm.patchValue({
            id: -1,
            nom: "",
            description: ""
        });
        this.showFormulaire.set(false);
    }

    /**
     * Cette fonction renvoit l'index du typeIncident dont l'id est en
     * paramètre. Il cherche dans le tableau de tout les rôles
     * S'il ne trouve pas, il rnevoit -1
     * @param id 
     * @returns 
     */
    gettypeIncidentIndexById(id: number): number{
        //renvoit -1 si il ne trouve pas
        return this.typeIncidents().findIndex(
            typeIncident => typeIncident.id == id
        );
    }

    onFilter(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.dt.filterGlobal(inputElement.value, 'contains');
    }

    confirmDelete(event: Event ,typeIncidentToDelete: TypeIncident) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Etes-vous sûr de vouloir supprimer ce typeIncident ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deletetypeIncident(typeIncidentToDelete);
            },
            
        });
    }

}