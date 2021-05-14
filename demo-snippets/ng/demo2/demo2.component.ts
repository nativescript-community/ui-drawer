import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';

@Component({
    selector: 'ns-demo2',
    templateUrl: './demo2.component.html'
})
export class Demo2Component implements OnInit {
    constructor(private router: RouterExtensions) {}

    ngOnInit(): void {}

    goBack(): void {
        this.router.back();
    }
}
