import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { RegisterComponent } from './auth/register/register.component';
import { ConnexionComponent } from './auth/connexion/connexion.component';
import { authGuard } from './auth/auth.guard';
import { RoleComponent } from './pages/role/role.component';

export const routes: Routes = [
    {
        path: "",
        component: LayoutComponent, 
        children: [ 
            {path: "roles", component: RoleComponent},

        ],
        canActivate: [authGuard]
    },

    { path: "register", component: RegisterComponent },
    { path: "login", component: ConnexionComponent },
];
