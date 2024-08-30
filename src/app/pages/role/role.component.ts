import { Component, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Role } from './role.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingComponent } from '../../Share/loading/loading.component';
import { RoleService } from './role.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
    standalone: true,
    selector: 'app-role',
    templateUrl: './role.component.html',
    imports: [
        TableModule,
        ButtonModule,
        DialogModule,
        ReactiveFormsModule,
        LoadingComponent,
        FloatLabelModule,
        InputTextModule,
        InputTextareaModule
    ]
})
export class RoleComponent implements OnInit {

    roles = signal<Role[]>([]);//liste de tout les roles
    roleForm!: FormGroup;//formulaire pour créer et update un role
    isLoading = signal(false);//booléen pour afficher le loading
    showFormulaire = signal(false);//ce booléen indique si on doit afficher le formulaire

    constructor(
        private fb: FormBuilder,
        private roleService: RoleService //service qui est charger de la communication avec l'api
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.initData().then();
    }

    /**
     * Cette fonction initalise le formulaire
     */
    initForm(): void{
        this.roleForm = this.fb.group({
            //comme aucun role normale n'a le id -1, en fesant cela ca me permet de savoir
            //si le formulaire contient les infos d'un rôle ou pas
            id: [-1],
            nom: ["", Validators.required],
            description: ["", Validators.required]
        });
    }

    /**
     * Cette fonction récupère tout les roles du backend
     */
    async initData(){
        this.isLoading.set(true);//permet d'afficher le loading
        try {
            this.roles.set(
                await this.roleService.getAll()
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
     * @param role 
     */
    update(role: Role){
        //remplissage
        this.roleForm.patchValue({
            id: role.id,
            nom: role.nom,
            description: role.description
        });
        //déclenchement de l'affichage du formulaire
        this.showFormulaire.set(true);
    }

    /**
     * Fonction chargée de la création et de la mise à jour du formulaire
     */
    async save(){
        const formulaireData = this.roleForm.value as Role;
        this.isLoading.set(true);
        try{
            /*Si id=-1 alors le formulaire ne contient pas les infos d'un role.
            **Donc c'est une création
            */
            if(formulaireData.id == -1){
                //si c'est -1 alors on veut faire un ajout
                //On attend l'ajout au backend
                const savedRole = await this.roleService.create(formulaireData);
                //on met à jour le tableau
                this.roles.update((val)=>{
                    //on ajoute le nouveau role
                    val.push(savedRole);
                    return val;
                });
            }else
            /*Dans ce cas le formulaire contient les données d'un role
            **alors on tente de le mettre à jour
            **/
            {
                //s'il y a un id valide alors c'est un update
                //on attend la mise
                await this.roleService.update(formulaireData);
                //on récupère l'index du role modifié dans le tableau de tout les roles
                const roleIndex = this.getRoleIndexById(formulaireData.id);
                if(roleIndex!=-1){
                    //role trouvé dans le tableau
                    this.roles.update(val => {
                        //on met à jour le role à cet index
                        val[roleIndex] = formulaireData;
                        return val;
                    });
                }
            }
            //on ferme le formulaire
            this.closeForm();
        } catch(err) {
            console.log(err);
        }finally{

            this.isLoading.set(false);
        }
    }

    /**
     * Cette fonction supprime un rôle
     * @param roleToDelete 
     */
    async deleteRole(roleToDelete: Role){
        this.isLoading.set(true);
        try {
            //Attente de la suppression au backend
            await this.roleService.delete(roleToDelete.id);
            //suppression dans notre tableau
            this.roles.update(val => {
                //cette fonction filtre et retourne tout les roles ou : role.id!=roleToDelete.id
                return val.filter(role => role.id!=roleToDelete.id);
            });    
        } catch (error) {
            console.log(error);
        }finally{
            this.isLoading.set(false);
        }
    }

    /**
     * Cette fonction remet le formulaire a son état initiale et le ferme
     */
    closeForm(){
        this.roleForm.patchValue({
            id: -1,
            nom: "",
            description: ""
        });
        this.showFormulaire.set(false);
    }

    /**
     * Cette fonction renvoit l'index du role dont l'id est en
     * paramètre. Il cherche dans le tableau de tout les rôles
     * S'il ne trouve pas, il rnevoit -1
     * @param id 
     * @returns 
     */
    getRoleIndexById(id: number): number{
        //renvoit -1 si il ne trouve pas
        return this.roles().findIndex(
            role => role.id == id
        );
    }


}
