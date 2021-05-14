import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';

@Component({
    selector: 'ns-development',
    templateUrl: './development.component.html'
})
export class DevelopmentComponent implements OnInit {
    constructor(private router: RouterExtensions) {}

    ngOnInit(): void {}

    goBack(): void {
        this.router.back();
    }
}
