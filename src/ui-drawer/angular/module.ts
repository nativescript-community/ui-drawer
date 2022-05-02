import { Component, Directive, ElementRef, EmbeddedViewRef, Host, HostListener, Inject, NgModule, TemplateRef } from '@angular/core';
import { TouchGestureEventData, isAndroid } from '@nativescript/core';
import { NgView, ViewClassMeta, registerElement } from '@nativescript/angular';
import { Drawer } from '@nativescript-community/ui-drawer';

declare namespace android {
    namespace view {
        class MotionEvent {
            public static ACTION_DOWN: number;
            public static ACTION_MOVE: number;
        }
    }
}

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

    constructor(@Inject(ElementRef) public elementRef: ElementRef) {
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
    constructor(@Inject(ElementRef) elementRef: ElementRef) {
        elementRef.nativeElement.id = LEFTDRAWER;
    }
}
/**
 * Directive identifying the right drawer
 */
@Directive({
    selector: '[rightDrawer]'
})
export class RightDrawerDirective {
    constructor(@Inject(ElementRef) elementRef: ElementRef) {
        elementRef.nativeElement.id = RIGHTDRAWER;
    }
}

/**
 * Directive identifying the right drawer
 */
@Directive({
    selector: '[topDrawer]'
})
export class TopDrawerDirective {
    constructor(@Inject(ElementRef) elementRef: ElementRef) {
        elementRef.nativeElement.id = TOPDRAWER;
    }
}

/**
 * Directive identifying the right drawer
 */
@Directive({
    selector: '[bottomDrawer]'
})
export class BottomDrawerDirective {
    constructor(@Inject(ElementRef) elementRef: ElementRef) {
        elementRef.nativeElement.id = BOTTOMDRAWER;
    }
}

/**
 * Directive identifying the main content.
 */
@Directive({
    selector: '[mainContent]'
})
export class MainContentDirective {
    constructor(@Inject(ElementRef) elementRef: ElementRef) {
        elementRef.nativeElement.id = MAINCONTENT;
    }
}

/**
 * Directive allows intercepting touch events (e.g. for inner scrolls)
 */
@Directive({
    selector: '[drawerInterceptTouch]'
})
export class DrawerInterceptTouchDirective {
    constructor(@Host() private _drawerComponent: DrawerComponent) {}

    @HostListener('touch', [ '$event' ]) public interceptTouch(event: TouchGestureEventData) {
        if (isAndroid) {
            const shouldIntercept = [
                android.view.MotionEvent.ACTION_DOWN,
                android.view.MotionEvent.ACTION_MOVE
            ].indexOf(event.android.getActionMasked()) !== -1;
            this._drawerComponent?.nativeElement?.android
                .requestDisallowInterceptTouchEvent(shouldIntercept);
        }
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
    declarations: [DrawerComponent, DrawerInterceptTouchDirective, SIDEDRAWER_DIRECTIVES],
    exports: [DrawerComponent, DrawerInterceptTouchDirective, SIDEDRAWER_DIRECTIVES]
})
export class DrawerModule {}
