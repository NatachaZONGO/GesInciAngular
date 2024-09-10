import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AuthService } from '../auth/auth.service';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss',
    standalone: true,
    providers: [MessageService],
    imports:[
        ButtonModule,
        MenuModule,
        RouterOutlet,
        OverlayPanelModule,
        ToastModule,
        
    ]
})
export class LayoutComponent implements OnInit {
    items: MenuItem[] | undefined;
    userMenuItems: MenuItem[] | undefined;
    isMenuOpen = signal(true);   
    
    constructor (
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        
    ) { }

    switchMenu() {
        console.log("SWITCH");
        
        this.isMenuOpen.update((val) => !val);
    }

    ngOnInit() {
        this.userMenuItems = [
          {
            label: 'New',
            icon: 'pi pi-plus',
          },
          {
            label: 'New',
            icon: 'pi pi-plus',
          }  
        ];
        this.items = [
            {
                label: 'Documents',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-plus',
                        command: () => {
                            console.log("SALUT");
                            
                        }
                    },
                    {
                        label: 'Search',
                        icon: 'pi pi-search'
                    }
                ]
            },
            {
                label: 'Parametre',
                icon: 'pi pi-spin pi-cog',
                
                items: [
                   
                    {
                        label: 'Utilisateurs',
                        icon: 'pi pi-cog',
                        route: "users"
                    },
                    {
                        label: 'Roles',
                        icon: 'pi pi-cog',
                        route: "roles"
                    },
                    {
                        label: 'Departements',
                        icon: 'pi pi-cog',
                        route: "departements"
                    },
                    {
                        label: 'Services',
                        icon: 'pi pi-cog',
                        route: "services"
                    },
                    {
                        label: 'Types Incidents',
                        icon: 'pi pi-cog',
                        route: "typeIncidents"
                    }
                ]
            },
            {
                label: 'Profile',
                items: [
                    {
                        label: 'Settings',
                        icon: 'pi pi-cog'
                    },
                    {
                        label: 'Logout',
                        icon: 'pi pi-sign-out',
                        command: () => {
                            this.authService.logout();
                            this.router.navigateByUrl('login');
                        }
                    }
                ]
            }
        ];
    }

}