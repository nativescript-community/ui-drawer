import * as React from 'react';
import { GridLayoutAttributes, NSVElement, NativeScriptProps, registerElement } from 'react-nativescript';
import { Color, View } from '@nativescript/core';
import { Mode, Drawer as NativeScriptDrawer, Side } from '..';

export function registerDrawer() {
    registerElement('drawer', () => require('../').Drawer);
}

interface DrawerAttributes extends GridLayoutAttributes {
    backdropColor?: Color;
    gestureEnabled?: boolean;
    leftDrawer?: View;
    mainContent?: View;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            drawer: NativeScriptProps<DrawerAttributes, NativeScriptDrawer>;
        }
    }
}

export const Drawer = React.forwardRef<NSVElement<NativeScriptDrawer>, NativeScriptProps<DrawerAttributes, NativeScriptDrawer>>((props, ref) => <drawer {...props} ref={ref} />);
