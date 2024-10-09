import { ButtonModule } from 'primeng/button';
import { Component, ElementRef, OnInit, signal, ViewChild, viewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AllStatutsIncident, Incident } from '../../pages/incident/incident.model';
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
    NombreInci: any[] = [];

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
        this.loadIncidentCount();
     }

  // Méthode pour charger les données des incidents
  async loadIncidentData() {
    try {
        const incidents = await this.incidentService.getAll();
        const statutCounts = this.countStatutOccurrences(incidents);
        const prioriteCounts = this.countPrioriteOccurrences(incidents);

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

        // Mise à jour de NombreInci en fonction des données récupérées
        this.NombreInci = [
            { label: 'Nombre d\'incidents de la journée', color1: '#dc2626', color2: '#f87171', value: this.countIncidentsToday(incidents), icon: 'pi pi-calendar' }, 
            { label: 'Nombre d\'incidents signalés', color1: '#f59e0b', color2: '#fde68a', value: incidents.length, icon: 'pi pi-exclamation-triangle' }, 
            { label: 'Nombre d\'incidents en cours', color1: '#2563eb', color2: '#60a5fa', value: statutCounts['En cours'], icon: 'pi pi-spinner' }, 
            { label: 'Nombre d\'incidents résolus', color1: '#16a34a', color2: '#6ee7b7', value: statutCounts['Traité'], icon: 'pi pi-check' }
        ];

        // Initialisation des graphiques
        this.initChart();
    } catch (error) {
        console.error('Erreur lors du chargement des données des incidents:', error);
    }
}

// Méthode pour compter les incidents de la journée
countIncidentsToday(incidents: any[]): number {
  const today = new Date().toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
  return incidents.filter(incident => incident.date === today).length;
}

  // Méthode pour compter les occurrences de chaque statut
  countStatutOccurrences(incidents: Incident[]): { [key: string]: number } {
    const statutCounts: { [key: string]: number } = {
        'Cree': 0,
        'En cours': 0,
        'Traite': 0
    };

    incidents.forEach(incident => {
        const statut = incident.statut;
        // Correction pour respecter les noms de statut
        if (statut === 'cree') {
            statutCounts['Cree']++;
        } else if (statut === 'en_cours') {
            statutCounts['En cours']++;
        } else if (statut === 'traite') {
            statutCounts['Traite']++;
        }
    });

    return statutCounts;
}


// Méthode pour compter les occurrences de chaque priorite
  countPrioriteOccurrences(incidents: Incident[]): { [key: string]: number } {
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
        type: 'bar',
        data: this.dataStatut,
        options: this.options
      });
    } else {
      console.error('Le canvas pour le graphique des statuts n\'a pas été initialisé correctement.');
    }
  
    if (canvasPriorite) {
      new Chart(canvasPriorite, {
        type: 'bar',
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

   // Méthode pour charger dynamiquement le nombre d'incidents
   async loadIncidentCount() {
    try {
        // Appel à l'API pour récupérer les incidents
        const incidents = await this.incidentService.getAll();

        // Compter les incidents pour chaque catégorie
        const incidentsDuJour = incidents.filter((incident: Incident) => this.isIncidentToday(incident.date_soumission)).length;
        const incidentsSignales = incidents.length; // Nombre total d'incidents
        const incidentsEnCours = incidents.filter((incident: Incident) => incident.statut === 'en_cours').length;
        const incidentsResolus = incidents.filter((incident: Incident) => incident.statut === 'traite').length;
        // Mettre à jour les valeurs dynamiques pour "NombreInci"
        this.NombreInci = [
            { label: 'Nombre d\'incidents de la journée', color1: '#dc2626', color2: '#f87171', value: incidentsDuJour, icon: 'pi pi-calendar' }, // Incidents du jour
            { label: 'Nombre d\'incidents signalés', color1: '#f59e0b', color2: '#fde68a', value: incidentsSignales, icon: 'pi pi-exclamation-triangle' }, // Total incidents
            { label: 'Nombre d\'incidents en cours', color1: '#2563eb', color2: '#60a5fa', value: incidentsEnCours, icon: 'pi pi-spinner' }, // Incidents en cours
            { label: 'Nombre d\'incidents résolus', color1: '#16a34a', color2: '#6ee7b7', value: incidentsResolus, icon: 'pi pi-check' } // Incidents résolus
        ];
    } catch (error) {
        console.error('Erreur lors du chargement des incidents:', error);
    }
}

// Vérifie si un incident est survenu aujourd'hui
isIncidentToday(date: Date): boolean {
    const today = new Date();
    const incidentDate = new Date(date);
    return today.toDateString() === incidentDate.toDateString();
}
}