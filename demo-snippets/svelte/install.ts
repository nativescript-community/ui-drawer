import DrawerElement from '@nativescript-community/ui-drawer/svelte';
import { install as installDrawer } from '@nativescript-community/ui-drawer';

import BasicDrawer from './BasicDrawer.svelte';
import AllSides from './AllSides.svelte';

export function install() {
    DrawerElement.register();
    installDrawer();
}

export const demos = [
    { name: 'Basic Drawer', path: "basic", component: BasicDrawer },
    { name: 'All Sides', path: "all-sides", component: AllSides }
];
