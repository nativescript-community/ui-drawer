import { Component, Directive, ElementRef, EmbeddedViewRef, EventEmitter, Inject, Input, NgModule, Output, TemplateRef, ViewContainerRef } from '@angular/core';
import { NgView, ViewClassMeta, registerElement } from '@nativescript/angular';
import { Drawer } from '@nativescript-community/ui-drawer';

const TKLEFTDRAWER: string = 'TKLeftDrawer';
const TKRIGHTDRAWER: string = 'TKRightDrawer';
const TKMAINCONTENT: string = 'TKMainContent';

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
    template: '<ng-content></ng-content>',
})
export class DrawerComponent {
    public drawer: Drawer;
    public mainTemplate: TemplateRef<ElementRef>;
    public drawerTemplate: TemplateRef<ElementRef>;

    private _gestureEnabled: boolean;

    // @Output() public drawerOpening: EventEmitter<any> = new EventEmitter();
    // @Output() public drawerOpen: EventEmitter<any> = new EventEmitter();
    // @Output() public drawerClosing: EventEmitter<any> = new EventEmitter();
    // @Output() public drawerClosed: EventEmitter<any> = new EventEmitter();

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
    selector: '[tkLeftDrawer]',
})
export class TKLeftDrawerDirective {
    constructor(@Inject(ElementRef) private _elementRef: ElementRef) {
        this._elementRef.nativeElement.id = TKLEFTDRAWER;
    }
}
/**
 * Directive identifying the right drawer
 */
@Directive({
    selector: '[tkLeftDrawer]',
})
export class TKRightDrawerDirective {
    constructor(@Inject(ElementRef) private _elementRef: ElementRef) {
        this._elementRef.nativeElement.id = TKRIGHTDRAWER;
    }
}

/**
 * Directive identifying the main content.
 */
@Directive({
    selector: '[tkMainContent]',
})
export class TKMainContentDirective {
    constructor(@Inject(ElementRef) private _elementRef: ElementRef) {
        this._elementRef.nativeElement.id = TKMAINCONTENT;
    }
}

const sideDrawerMeta: ViewClassMeta = {
    insertChild: (parent: NgView, child: NgView) => {
        const drawer = (parent as any) as Drawer;
        const childView = child;

        if (childView.id === TKMAINCONTENT) {
            drawer.mainContent = childView;
        }

        if (childView.id === TKLEFTDRAWER) {
            drawer.leftDrawer = childView;
        }
        if (childView.id === TKRIGHTDRAWER) {
            drawer.rightDrawer = childView;
        }
    },
    removeChild: (parent: NgView, child: NgView) => {
        const drawer = (parent as any) as Drawer;
        const childView = child;

        if (childView.id === TKMAINCONTENT) {
            drawer.mainContent = null;
        }

        if (childView.id === TKLEFTDRAWER) {
            drawer.leftDrawer = null;
        }
        if (childView.id === TKRIGHTDRAWER) {
            drawer.rightDrawer = null;
        }
    },
};

/**
 * Directives identifying the RadSideDrawer.
 */
export const SIDEDRAWER_DIRECTIVES = [DrawerComponent, TKLeftDrawerDirective, TKRightDrawerDirective, TKMainContentDirective];

registerElement('RadSideDrawer', () => Drawer, sideDrawerMeta);

/**
 * NgModule containing all of the RadSideDrawer directives.
 */
@NgModule({
    declarations: [SIDEDRAWER_DIRECTIVES],
    exports: [SIDEDRAWER_DIRECTIVES],
})
export class NativeScriptDrawerModule {}
