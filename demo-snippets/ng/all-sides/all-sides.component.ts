import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Drawer } from '@nativescript-community/ui-drawer';

@Component({
    selector: 'ns-all-sides',
    templateUrl: './all-sides.component.html',
    styleUrls: ['./all-sides.component.scss']
})
export class AllSidesComponent implements OnInit {
    drawer: Drawer;

    @ViewChild('drawer', { static: true }) drawerElementRef: ElementRef;

    constructor(private router: RouterExtensions) {}

    ngOnInit(): void {
        this.drawer = this.drawerElementRef.nativeElement;
    }

    onOpenDrawer(side: string) {
        if (side === 'left') {
            {
                this.drawer.open('left');
            }
        } else if (side === 'right') {
            {
                this.drawer.open('right');
            }
        } else if (side === 'top') {
            {
                this.drawer.open('top');
            }
        } else if (side === 'bottom') {
            this.drawer.open('bottom');
        }
    }

    onCloseDrawer() {
        this.drawer.close();
    }

    goBack(): void {
        this.router.back();
    }
}
