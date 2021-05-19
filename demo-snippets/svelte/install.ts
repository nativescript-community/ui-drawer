import SimpleDrawer from './SimpleDrawer.svelte';
import AllSides from './AllSides.svelte';
import Development from './Development.svelte';

import * as drawer from '@nativescript-community/ui-drawer';

import DrawerElement from '@nativescript-community/ui-drawer/svelte';

export function install() {
    drawer.install();
    DrawerElement.register();
}

export const demos = [
    { name: 'Simple Drawer', path: "simple-drawer", component: SimpleDrawer },
    { name: 'All Sides', path: "all-sides", component: AllSides },
    { name: 'Development', path: "development", component: Development }
];
