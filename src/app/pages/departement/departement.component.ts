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
import { Departement } from './departement.model';
import { DepartementService } from './departement.service';




@Component({
    standalone: true,
    selector: 'app-departement',
    templateUrl: './departement.component.html',
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
export class DepartementComponent implements OnInit {
@ViewChild ('dt') dt! : Table;  

    departements = signal<Departement[]>([]);//liste de tout les departements
    departementForm!: FormGroup;//formulaire pour créer et update un departement
    isLoading = signal(false);//booléen pour afficher le loading
    showFormulaire = signal(false);//ce booléen indique si on doit afficher le formulaire

    constructor(
        private fb: FormBuilder,
        private DepartementService: DepartementService, //service qui est charger de la communication avec l'api
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
        this.departementForm = this.fb.group({
            //comme aucun departement normale n'a le id -1, en fesant cela ca me permet de savoir
            //si le formulaire contient les infos d'un rôle ou pas
            id: [-1],
            nom: ["", Validators.required],
            description: ["", Validators.required]
        });
    }

    /**
     * Cette fonction récupère tout les departements du backend
     */
    async initData(){
        this.isLoading.set(true);//permet d'afficher le loading
        try {
            this.departements.set(
                await this.DepartementService.getAll()
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
     * @param departement 
     */
    update(departement: Departement){
        //remplissage
        this.departementForm.patchValue({
            id: departement.id,
            nom: departement.nom,
            description: departement.description
        });
        //déclenchement de l'affichage du formulaire
        this.showFormulaire.set(true);
    }

    /**
     * Fonction chargée de la création et de la mise à jour du formulaire
     */
    async save(){
        const formulaireData = this.departementForm.value as Departement;
        this.isLoading.set(true);
        try{
            /*Si id=-1 alors le formulaire ne contient pas les infos d'un departement.
            **Donc c'est une création
            */
            if(formulaireData.id == -1){
                //si c'est -1 alors on veut faire un ajout
                //On attend l'ajout au backend
                const savedDepartement = await this.DepartementService.create(formulaireData);
                //on met à jour le tableau
                this.departements.update((val)=>{
                    //on ajoute le nouveau departement
                    val.push(savedDepartement);
                    return val;
                });
                this.messageService.add({severity:'success', summary: 'Succès', detail: 'departement ajouté avec succès', life: 3000});
            }else
            /*Dans ce cas le formulaire contient les données d'un departement
            **alors on tente de le mettre à jour
            **/
            {
                //s'il y a un id valide alors c'est un update
                //on attend la mise
                await this.DepartementService.update(formulaireData);
                //on récupère l'index du departement modifié dans le tableau de tout les departements
                const departementIndex = this.getdepartementIndexById(formulaireData.id);
                if(departementIndex!=-1){
                    //departement trouvé dans le tableau
                    this.departements.update(val => {
                        //on met à jour le departement à cet index
                        val[departementIndex] = formulaireData;
                        return val;
                    });
                    this.messageService.add({severity:'success', summary: 'Succès', detail: 'departement mis à jour avec succès', life: 3000});
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
     * @param departementToDelete 
     */
    async deleteDepartement(departementToDelete: Departement){
        this.isLoading.set(true);
        try {
            //Attente de la suppression au backend
            await this.DepartementService.delete(departementToDelete.id);
            //suppression dans notre tableau
            this.departements.update(val => {
                //cette fonction filtre et retourne tout les departements ou : departement.id!=departementToDelete.id
                return val.filter(departement => departement.id!=departementToDelete.id);
            }); 
            this.messageService.add({severity:'success', summary: 'Succès', detail: 'departement supprimé avec succès', life: 3000});   
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
        this.departementForm.patchValue({
            id: -1,
            nom: "",
            description: ""
        });
        this.showFormulaire.set(false);
    }

    /**
     * Cette fonction renvoit l'index du departement dont l'id est en
     * paramètre. Il cherche dans le tableau de tout les rôles
     * S'il ne trouve pas, il rnevoit -1
     * @param id 
     * @returns 
     */
    getdepartementIndexById(id: number): number{
        //renvoit -1 si il ne trouve pas
        return this.departements().findIndex(
            departement => departement.id == id
        );
    }

    onFilter(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.dt.filterGlobal(inputElement.value, 'contains');
    }

    confirmDelete(event: Event ,departementToDelete: Departement) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Etes-vous sûr de vouloir supprimer ce departement ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui', 
            rejectLabel: 'Non', 
            accept: () => {
                this.deleteDepartement(departementToDelete);
            },
            
        });
    }

    //fonction pour recuperer les departement et les services lies
    
}