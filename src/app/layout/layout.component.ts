import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss',
    standalone: true,
    imports:[
        ButtonModule,
        MenuModule,
        RouterOutlet,
        OverlayPanelModule,
        
    ]
})
export class LayoutComponent implements OnInit {
    items: MenuItem[] | undefined;
    userMenuItems: MenuItem[] | undefined;
    isMenuOpen = signal(true);   
    
    constructor (
        private authService: AuthService,
        private router: Router,
        
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