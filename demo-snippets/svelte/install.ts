import DrawerElement from '@nativescript-community/ui-drawer/svelte';
import { install } from '@nativescript-community/ui-drawer';

import BasicDrawer from './BasicDrawer.svelte';
import AllSides from './AllSides.svelte';

export function installPlugin() {
    DrawerElement.register();
    install();
}

export const demos = [
    { name: 'Basic Drawer', path: 'basic', component: BasicDrawer },
    { name: 'All Sides', path: 'all-sides', component: AllSides }
];
