import { ServiceComponent } from './pages/service/service.component';
import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { RegisterComponent } from './auth/register/register.component';
import { ConnexionComponent } from './auth/connexion/connexion.component';
import { authGuard } from './auth/auth.guard';
import { RoleComponent } from './pages/role/role.component';
import { UserComponent } from './pages/user/user.component';
import { DepartementComponent } from './pages/departement/departement.component';
import { TypeIncidentComponent } from './pages/type_incident/type_incident.component';
import { IncidentSignalerComponent } from './pages/incident/incident.signaler/incident.signaler.component';
import { IncidentComponent } from './pages/incident/incident.component';


export const routes: Routes = [



    {   

        path: "",
        component: LayoutComponent, 
        children: [ 
            {path: "roles", component: RoleComponent},
            {path:"users", component: UserComponent},
            {path:"departements", component: DepartementComponent},
            {path:"services", component: ServiceComponent},
            {path:"typeIncidents", component: TypeIncidentComponent},
            {path:"signalerIncident/:id", component: IncidentSignalerComponent},
            {path:"signalerIncident", component: IncidentSignalerComponent},
            {path:"incidents", component: IncidentComponent},
        ],
        canActivate: [authGuard]
    },


    { 
        path: "register", 
        component: RegisterComponent 
    },

        {
            path: "login",
            component: ConnexionComponent
        },

        
    
];
