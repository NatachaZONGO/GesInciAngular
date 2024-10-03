import { ButtonModule } from 'primeng/button';
import { Component, ElementRef, OnInit, signal, ViewChild, viewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AllStatutsIncident } from '../../pages/incident/incident.model';
import { Chart, scales } from 'chart.js';
import { IncidentService } from '../../pages/incident/incident.service';
import { MeterGroupModule } from 'primeng/metergroup';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DepartementService } from '../../pages/departement/departement.service';
import { ServiceService } from '../../pages/service/service.service';
import { UserService } from '../../pages/user/user.service';
import { RoleService } from '../../pages/role/role.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './daschboard.component.html',
    styleUrl: './daschboard.component.scss',
    standalone: true,
    imports:[
        ChartModule,
        MeterGroupModule,
        CommonModule,
        ButtonModule,
        CardModule,
    ]
})
export class DaschboardComponent implements OnInit {

    dataStatut : any;
    dataPriorite : any;
    options : any;
    value: any[] = [];

    @ViewChild('chartStatut') chartStatut!: ElementRef<HTMLCanvasElement>;
    @ViewChild('chartPriorite') chartPriorite!: ElementRef<HTMLCanvasElement>;
    

    constructor(
        private incidentService: IncidentService,
        private departementService: DepartementService, 
        private serviceService: ServiceService,
        private roleService: RoleService,
    ) { }

    ngOnInit(): void {
        this.loadIncidentData();
        this.loadValues();
     }

     // Méthode pour charger les données des incidents
  async loadIncidentData() {
    try {
      const incidents = await this.incidentService.getAll();
      const statutCounts = this.countStatutOccurrences(incidents);
      const prioriteCounts = this.countPrioriteOccurrences(incidents);

      // Préparation des données pour le graphique
 // Préparation des données pour le graphique de Statut
this.dataStatut = {
  labels: Object.keys(statutCounts),
  datasets: [
    {
      data: Object.values(statutCounts),
      backgroundColor: ['#FF3D33', '#42A5F5', '#4CAF50'], // Rouge pour "créé", Bleu pour "en cours", Vert pour "traité"
      hoverBackgroundColor: ['#FF6F61', '#64B5F6', '#81C784'] // Couleurs légèrement plus claires au survol
    }
  ]
};

this.options = {
  plugins: {
    legend: {
      labels: {
        color: '#495057'
      }
    }
  }
};

// Préparation des données pour le graphique de Priorité
this.dataPriorite = {
  labels: Object.keys(prioriteCounts),
  datasets: [
    {
      data: Object.values(prioriteCounts),
      backgroundColor: ['#FFAB91','#FF7043','#FF3D33', ], // Rouge pour "forte", Moins rouge pour "moyenne", Très léger rouge pour "faible"
      hoverBackgroundColor: ['#FFCCBC','#FF8A65','#FF6F61'] // Couleurs légèrement plus claires au survol
    }
  ]
};

this.options = {
  plugins: {
    legend: {
      labels: {
        color: '#495057'
      }
    }
  }
};

    

      // Initialisation du graphique avec Chart.js
      this.initChart();
    } catch (error) {
      console.error('Erreur lors du chargement des données des incidents:', error);
    }
// graphique priorite
    
  }

  // Méthode pour compter les occurrences de chaque statut
  countStatutOccurrences(incidents: any[]): { [key: string]: number } {
    const statutCounts: { [key: string]: number } = {
      'Créé': 0,
      'En cours': 0,
      'Traité': 0
    };

    incidents.forEach(incident => {
      const statut = incident.statut;
      if (statut === 'cree') {
        statutCounts['Créé']++;
      } else if (statut === 'en_cours') {
        statutCounts['En cours']++;
      } else if (statut === 'traite') {
        statutCounts['Traité']++;
      }
    });

    return statutCounts;
  }

  // Méthode pour compter les occurrences de chaque priorite
  countPrioriteOccurrences(incidents: any[]): { [key: string]: number } {
    const prioriteCounts: { [key: string]: number } = {
      'Faible': 0,
      'Moyenne': 0,
      'Forte': 0
    };

    incidents.forEach(incident => {
      const priorite = incident.priorite;
      if (priorite === 'faible') {
        prioriteCounts['Faible']++;
      } else if (priorite === 'moyenne') {
        prioriteCounts['Moyenne']++;
      } else if (priorite === 'forte') {
        prioriteCounts['Forte']++;
      }
    });

    return prioriteCounts;
  }

  // Méthode pour initialiser le graphique
  initChart() {
    const canvasStatut = this.chartStatut.nativeElement;
    const canvasPriorite = this.chartPriorite.nativeElement;
  
    if (canvasStatut) {
      new Chart(canvasStatut, {
        type: 'pie',
        data: this.dataStatut,
        options: this.options
      });
    } else {
      console.error('Le canvas pour le graphique des statuts n\'a pas été initialisé correctement.');
    }
  
    if (canvasPriorite) {
      new Chart(canvasPriorite, {
        type: 'pie',
        data: this.dataPriorite,
        options: this.options
      });
    } else {
      console.error('Le canvas pour le graphique des priorités n\'a pas été initialisé correctement.');
    }
  }
  

  async loadValues(): Promise<void> {
    try {
      // Utilisation de Promise.all pour exécuter plusieurs promesses en parallèle
      const [departements, services, roles] = await Promise.all([
        this.departementService.getAll(),
        this.serviceService.getAll(),
        this.roleService.getAll() // Récupération des rôles via RoleService
      ]);

      // Filtrer les rôles pour compter les agents maintenanciers et agents spéciaux
      const agentsMaintenanciers = roles.filter(role => role.nom === 'Agent');
      const agentsSpeciaux = roles.filter(role => role.nom === 'Agent special');

      // Comptabilisation des éléments récupérés
      this.value = [
        { label: 'Départements', color1: '#1e3a8a', color2: '#3b82f6', value: departements.length, icon: 'pi pi-sitemap' },
        { label: 'Services', color1: '#f59e0b', color2: '#fde68a', value: services.length, icon: 'pi pi-briefcase' },
        { label: 'Agents Maintenanciers', color1: '#10b981', color2: '#6ee7b7', value: agentsMaintenanciers.length, icon: 'pi pi-users' },
        { label: 'Agents Spéciaux', color1: '#9333ea', color2: '#c084fc', value: agentsSpeciaux.length, icon: 'pi pi-shield' }
      ];
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  NombreInci = [
    { label: 'Nombre d\'incidents du jour', color1: '#34d399', color2: '#fbbf24', value: 25, icon: 'pi pi-table' },
    { label: 'Messages', color1: '#fbbf24', color2: '#60a5fa', value: 15, icon: 'pi pi-inbox' },
    { label: 'Media', color1: '#60a5fa', color2: '#c084fc', value: 20, icon: 'pi pi-image' },
    { label: 'System', color1: '#c084fc', color2: '#c084fc', value: 10, icon: 'pi pi-cog' }
];


}  