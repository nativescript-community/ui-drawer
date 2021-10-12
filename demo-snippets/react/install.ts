import { BasicDrawer } from './BasicDrawer';
import { AllSides } from './AllSides';
import { install } from '@nativescript-community/ui-drawer';
import { registerDrawer } from '@nativescript-community/ui-drawer/react';

export function installPlugin() {
    install();
    registerDrawer();
}

export const demos = [
    { name: 'Basic Drawer', path: 'basic', component: BasicDrawer },
    { name: 'All Sides', path: 'all-sides', component: AllSides }
];
