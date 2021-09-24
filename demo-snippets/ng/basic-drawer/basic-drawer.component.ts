import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from '@nativescript/angular';
import { Drawer } from "@nativescript-community/ui-drawer";

@Component({
    selector: 'ns-basic-drawer',
    templateUrl: './basic-drawer.component.html',
    styleUrls: ["./basic-drawer.component.scss"],
})
export class BasicDrawerComponent implements OnInit {
    drawer: Drawer;

    @ViewChild("drawer", { static: true }) drawerElementRef: ElementRef;

    constructor(private router: RouterExtensions) {}


    goBack(): void {
        this.router.back();
    }

    ngOnInit(): void {
        this.drawer = this.drawerElementRef.nativeElement;
    }

    onOpenDrawer() {
        this.drawer.open();
    }

    onCloseDrawer() {
        this.drawer.close();
    }
}
