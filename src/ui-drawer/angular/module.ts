import { Component, Directive, ElementRef, EmbeddedViewRef, EventEmitter, Inject, Input, NgModule, Output, TemplateRef, ViewContainerRef } from '@angular/core';
import { NgView, ViewClassMeta, registerElement } from '@nativescript/angular';
import { Drawer } from '@nativescript-community/ui-drawer';

const LEFTDRAWER: string = 'LeftDrawer';
const RIGHTDRAWER: string = 'RightDrawer';
const TOPDRAWER: string = 'TopDrawer';
const BOTTOMDRAWER: string = 'BottomDrawer';
const MAINCONTENT: string = 'MainContent';

export interface ItemEventArgs {
    object: any;
    view: EmbeddedViewRef<any>;
    returnValue?: boolean;
}

/**
 * This is the SideDrawer component. It separates your mobile app's screen
 * into a main part and a menu part whereby the menu part is shown upon a swipe
 * gesture using a transition effect.
 */
@Component({
    selector: 'Drawer',
    template: '<ng-content></ng-content>'
})
export class DrawerComponent {
    public drawer: Drawer;
    public mainTemplate: TemplateRef<ElementRef>;
    public drawerTemplate: TemplateRef<ElementRef>;

    private _gestureEnabled: boolean;

    constructor(@Inject(ElementRef) public elementRef: ElementRef, @Inject(ViewContainerRef) private viewContainer: ViewContainerRef) {
        this.drawer = this.elementRef.nativeElement;
    }

    public get nativeElement(): Drawer {
        return this.drawer;
    }

    set gestureEnabled(value: boolean) {
        this._gestureEnabled = value;
        this.updateGestureEnabled();
    }

    private updateGestureEnabled() {
        this.drawer.gestureEnabled = this._gestureEnabled;
    }
}

/**
 * Directive identifying the left drawer
 */
@Directive({
    selector: '[leftDrawer]'
})
export class LeftDrawerDirective {
    constructor(@Inject(ElementRef) private _elementRef: ElementRef) {
        this._elementRef.nativeElement.id = LEFTDRAWER;
    }
}
/**
 * Directive identifying the right drawer
 */
@Directive({
    selector: '[rightDrawer]'
})
export class RightDrawerDirective {
    constructor(@Inject(ElementRef) private _elementRef: ElementRef) {
        this._elementRef.nativeElement.id = RIGHTDRAWER;
    }
}

/**
 * Directive identifying the right drawer
 */
@Directive({
    selector: '[topDrawer]'
})
export class TopDrawerDirective {
    constructor(@Inject(ElementRef) private _elementRef: ElementRef) {
        this._elementRef.nativeElement.id = TOPDRAWER;
    }
}

/**
 * Directive identifying the right drawer
 */
@Directive({
    selector: '[bottomDrawer]'
})
export class BottomDrawerDirective {
    constructor(@Inject(ElementRef) private _elementRef: ElementRef) {
        this._elementRef.nativeElement.id = BOTTOMDRAWER;
    }
}

/**
 * Directive identifying the main content.
 */
@Directive({
    selector: '[mainContent]'
})
export class MainContentDirective {
    constructor(@Inject(ElementRef) private _elementRef: ElementRef) {
        this._elementRef.nativeElement.id = MAINCONTENT;
    }
}

const sideDrawerMeta: ViewClassMeta = {
    insertChild: (parent: NgView, child: NgView) => {
        const drawer = parent as any as Drawer;
        const childView = child;

        if (childView.id === MAINCONTENT) {
            drawer.mainContent = childView;
        }

        if (childView.id === LEFTDRAWER) {
            drawer.leftDrawer = childView;
        }
        if (childView.id === RIGHTDRAWER) {
            drawer.rightDrawer = childView;
        }
        if (childView.id === TOPDRAWER) {
            drawer.topDrawer = childView;
        }
        if (childView.id === BOTTOMDRAWER) {
            drawer.bottomDrawer = childView;
        }
    },
    removeChild: (parent: NgView, child: NgView) => {
        const drawer = parent as any as Drawer;
        const childView = child;

        if (childView.id === MAINCONTENT) {
            drawer.mainContent = null;
        }

        if (childView.id === LEFTDRAWER) {
            drawer.leftDrawer = null;
        }
        if (childView.id === RIGHTDRAWER) {
            drawer.rightDrawer = null;
        }
        if (childView.id === TOPDRAWER) {
            drawer.topDrawer = null;
        }
        if (childView.id === BOTTOMDRAWER) {
            drawer.bottomDrawer = null;
        }
    }
};

/**
 * Directives identifying the Drawer.
 */
export const SIDEDRAWER_DIRECTIVES = [LeftDrawerDirective, RightDrawerDirective, TopDrawerDirective, BottomDrawerDirective, MainContentDirective];

registerElement('Drawer', () => Drawer, sideDrawerMeta);

/**
 * NgModule containing all of the RadSideDrawer directives.
 */
@NgModule({
    declarations: [DrawerComponent, SIDEDRAWER_DIRECTIVES],
    exports: [DrawerComponent, SIDEDRAWER_DIRECTIVES]
})
export class DrawerModule {}
