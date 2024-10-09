import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AuthService } from '../auth/auth.service';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { AllStatutsIncident } from '../pages/incident/incident.model';
import { User } from '../pages/user/user.model';
import { Subscription } from 'rxjs';
import { ConnexionComponent } from '../auth/connexion/connexion.component';
import { CommonModule } from '@angular/common';
import { color } from 'chart.js/helpers';


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
        ChartModule,
        CommonModule
    ]
})
export class LayoutComponent implements OnInit, OnDestroy {
    items: MenuItem[] | undefined;
    userMenuItems: MenuItem[] | undefined;
    isMenuOpen = signal(true); 
    utilisateur: User | null = null;
    subscriptions: Subscription[] = [];
    
    constructor (
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        
    ) { }

    canShow(roles: string[]|undefined): boolean{
        if(!roles) return true;
        
        const userRole = this.authService.rolesNames();
        let contain = undefined;
        for (let i = 0; i < roles.length; i++) {
            contain = userRole.find(r => r==roles[i]);
            if(contain) return true;
        }
        return false;
    }

    switchMenu() {
        console.log("SWITCH");
        
        this.isMenuOpen.update((val) => !val);
    }

    ngOnInit() {
        this.userMenuItems = [
          {
            label: 'Se deconnecter',
            icon: 'pi pi-power-off',
           command: () => {
               this.router.navigateByUrl('login');
           }
          }
        ];
        this.items = [
            {
               
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-home',
                        command: () => {
                            this.router.navigateByUrl('');
                        }
                    },
                    {},
                    {
                        label: 'Signaler incident',
                        icon: 'pi pi-exclamation-triangle' ,
                        command: () => {
                            this.router.navigateByUrl('signalerIncident');
                        }
                    },
                    {
                        label: 'Les incidents',
                        icon: 'pi pi-flag' ,
                        styleClass: 'incident-icon',
                        roles: ['Administrateur','Agent','Agent special'],
                        command: () => {
                            this.router.navigateByUrl('incidents');
                        }
                    },
                    {
                        label: 'Mes incidents',
                        icon: 'pi pi-bell',
                        styleClass: 'mes-incidents-icon',
                        command: () => {
                            this.router.navigateByUrl('mesIncidents');
                        }
                    },
                ]
            },
            {

            },
            
            {
                label: 'Parametre',
                icon: 'pi pi-spin pi-cog',
                roles: ['Administrateur'],
                items: [
                   
                    {
                        label: 'Utilisateurs',
                        icon: 'pi pi-users',
                        route: "users",
                        roles: ['Administrateur'],
                    },
                    {
                        label: 'Roles',
                        icon: 'pi pi-key',
                        route: "roles",
                        roles: ['Administrateur'],
                    },
                    {
                        label: 'Departements',
                        icon: 'pi pi-sitemap',
                        route: "departements",
                        roles: ['Administrateur'],
                    },
                    {
                        label: 'Services',
                        icon: 'pi pi-briefcase',
                        route: "services",
                        roles: ['Administrateur'],
                    },
                    {
                        label: 'Types Incidents',
                        icon: 'pi pi-tags',
                        route: "typeIncidents",
                        roles: ['Administrateur'],
                    }
                ]
            },
            {

            },
            {
                label: 'Profile',
                items: [
                    {
                        label: 'Mon Compte',
                        icon: 'pi pi-user',
                        command: () => {
                            this.router.navigateByUrl('profil');
                        }
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
            },
            
            {
                separator: true
            }
        ];


        const subs = this.authService.utilisateurConnecte$.subscribe({
            next: (user) => this.utilisateur = user,
            error: err => console.log(err),
        });
        this.subscriptions.push(subs);
    }
    
    ngOnDestroy(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}