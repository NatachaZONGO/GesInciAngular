import { Component, ElementRef, OnInit, signal, ViewChild, viewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AllStatutsIncident } from '../../pages/incident/incident.model';
import { Chart, scales } from 'chart.js';
import { IncidentService } from '../../pages/incident/incident.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './daschboard.component.html',
    styleUrl: './daschboard.component.scss',
    standalone: true,
    imports:[
        ChartModule,
    ]
})
export class DaschboardComponent implements OnInit {

    dataStatut : any;
    dataPriorite : any;
    options : any;

    @ViewChild('chartStatut') chartStatut!: ElementRef<HTMLCanvasElement>;
    @ViewChild('chartPriorite') chartPriorite!: ElementRef<HTMLCanvasElement>;
    

    constructor(
        private incidentService: IncidentService,
    ) { }

    ngOnInit(): void {
        this.loadIncidentData();
       /* const canvas = this.chartStatut();
        console.log(canvas);
        
        if(canvas){
            new Chart(canvas.nativeElement, {
                type: 'pie',
                data: {
                    labels : ['Red', 'Blue', 'Green'],
                    datasets: [{
                        label:'# of Votes',
                        data: [12, 19, 3],
                        borderWidth: 1
                    }]
                }
            });
            this.options={
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }


       /* const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.dataStatut = {
            labels: ['Cree', 'En cours', ,'Traite'],
            datasets: [
                {
                    dataStatut:[540, 325, 702],
                    backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500'), documentStyle.getPropertyValue('--green-500')],
                    hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400'), documentStyle.getPropertyValue('--green-400')]

                }
            ]
        };
        this.options = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };*/
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
  

}