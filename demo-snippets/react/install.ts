import * as drawer from '@nativescript-community/ui-drawer';
import { registerDrawer } from "@nativescript-community/ui-drawer/react";

import { SimpleDrawer } from './SimpleDrawer';
import { AllSides } from './AllSides';
import { Development } from './Development';

export function install() {
    drawer.install();
    registerDrawer();
}

export const demos = [
    { name: 'Simple Drawer', path: 'simple-drawer', component: SimpleDrawer },
    { name: 'All Sides', path: 'all-sides', component: AllSides },
    { name: 'Development', path: 'development', component: Development }
];
