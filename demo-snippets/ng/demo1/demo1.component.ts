import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';

@Component({
    selector: 'ns-demo1',
    templateUrl: './demo1.component.html'
})
export class Demo1Component implements OnInit {
    constructor(private router: RouterExtensions) {}

    ngOnInit(): void {}

    goBack(): void {
        this.router.back();
    }
}
