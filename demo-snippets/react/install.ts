import { BasicDrawer } from './BasicDrawer';
import { AllSides } from './AllSides';
import { install as installDrawer } from '@nativescript-community/ui-drawer';
import { registerDrawer } from "@nativescript-community/ui-drawer/react";

export function install() { 
    installDrawer();
    registerDrawer();
}

export const demos = [
    { name: 'Basic Drawer', path: 'basic', component: BasicDrawer },
    { name: 'All Sides', path: 'all-sides', component: AllSides }
];
