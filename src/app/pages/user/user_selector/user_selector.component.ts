import { Component, EventEmitter, input, model, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RoleService } from '../../role/role.service';

@Component({
    standalone: true,
    selector: 'app-user-selector',
    templateUrl: './user_selector.component.html',
    imports: [
        DialogModule,
        TableModule,
        ButtonModule,
    ],
})
export class UserSelectorComponent implements OnInit, OnChanges {
    visible = model<boolean>(false);
    isSingle = input<boolean>(false);
    isLoading = signal<boolean>(false);
    role = input<string>("");
    users = signal<User[]>([]);
    selectedUsers = signal<User[]|User|undefined>(undefined);

    @Output() onSingleUserSelected: EventEmitter<User> = new EventEmitter();
    @Output() onMultipleUserSelected: EventEmitter<User[]> = new EventEmitter();

    constructor(
        private userService: UserService,
        private roleService: RoleService
    ) { }
    ngOnChanges(changes: SimpleChanges): void {
        if(changes['visible'].currentValue == true){
            this.getUsersByRole(this.role()).then();
        }
    }

    ngOnInit(): void {
    }

    async getUsersByRole(roleName: string){
        this.isLoading.set(true);
        try {
            if(roleName == ""){
                this.users.set(
                    await this.userService.getAll() 
                );
            }else{
                const role = await this.roleService.getRoleByName(roleName);
                this.users.set(
                    await this.roleService.getUsersByRole(role.id)
                );
            }
        } catch (error) {
            console.log(error);
            this.visible.set(false);
        }finally{
            this.isLoading.set(false);
        }
    }

    confirmerSelection(){
        this.visible.set(false);
        if(this.isSingle()){
            this.onSingleUserSelected.emit(this.selectedUsers() as User);
        }else{
            this.onMultipleUserSelected.emit(this.selectedUsers() as User[]);
        }
        this.selectedUsers.set(undefined);
    }
}
