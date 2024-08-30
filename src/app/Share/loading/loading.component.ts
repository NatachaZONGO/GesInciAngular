import { Component, model, OnInit, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    standalone: true,
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    imports: [
        DialogModule,
        ProgressSpinnerModule
    ]
})
export class LoadingComponent implements OnInit {
    isLoading = model(false);
    constructor() { }

    ngOnInit(): void { }
}
