import { Component, computed, EventEmitter, model, OnChanges, OnInit, Output, Signal, signal, SimpleChanges } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { SidebarModule } from 'primeng/sidebar';
import { RoleService } from '../../role/role.service';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Role } from '../../role/role.model';
import { TableModule } from 'primeng/table';
import { User } from '../user.model';
import { ButtonModule } from 'primeng/button';

interface CheckedRole{
    isSelected: boolean,
    role: Role
}

@Component({
    selector: 'app-role_user',
    templateUrl: './role_user.component.html',
    standalone: true,
    imports: [
        CheckboxModule,
        SidebarModule,
        FormsModule,
        DialogModule,
        TableModule,
        ButtonModule
    ]
    
})
export class RoleUserComponent implements OnInit, OnChanges{

    user = model<User|undefined>();
    allRoles = signal<Role[]>([]);
    checkedRoles = signal<CheckedRole[]>([]);
    @Output()
    onSave: EventEmitter<number[]> = new EventEmitter<number[]>();


    constructor(
        private roleService : RoleService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        console.log("ngOnChanges");
        console.log(changes);
        const currentUser = changes["user"]?.currentValue as User;
        this.checkedRoles.set(
            this.allRoles().map((role: Role) => {
                const foundedRole = currentUser.roles.find(r => r.id === role.id);
                if(foundedRole != undefined){
                    return {
                        isSelected: true,
                        role: role
                    };
                }else{
                    return {
                        isSelected: false,
                        role: role
                    };
                }
            })
        );
    }

    ngOnInit(): void { 
        this.roleService.getAll().then((roles: Role[]) => {
            this.allRoles.set(roles);
           });
    }

    save(){
        const rolesId: number[] = [];
        this.checkedRoles().forEach(r => {
            if(r.isSelected){
                rolesId.push(r.role.id);
            }
        });
        this.onSave.emit(rolesId);
    }
}
