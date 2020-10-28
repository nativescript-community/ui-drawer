import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Drawer } from "@nativescript-community/ui-drawer";
@Component({
    selector: "ns-items",
    templateUrl: "./items.component.html",
    styleUrls: ["./items.component.css"]
})
export class ItemsComponent implements OnInit {
    drawer: Drawer;

    @ViewChild("drawer", { static: true }) drawerElementRef: ElementRef;

    constructor() { 
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
