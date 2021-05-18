import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from '@nativescript/angular';

import { Drawer } from "@nativescript-community/ui-drawer";
@Component({
    selector: 'ns-demo1',
    templateUrl: './demo1.component.html',
    styleUrls: ["./demo1.component.css"]
})
export class Demo1Component implements OnInit {
    drawer: Drawer;

    @ViewChild("drawer", { static: true }) drawerElementRef: ElementRef;

    constructor(private router: RouterExtensions) {}

    ngOnInit(): void {
        this.drawer = this.drawerElementRef.nativeElement;
    }

    onOpenDrawer() {
        this.drawer.open();
    }

    onCloseDrawer() {
        this.drawer.close();
    }

    goBack(): void {
        this.router.back();
    }
}
