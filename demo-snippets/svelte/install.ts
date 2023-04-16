import DrawerElement from '@nativescript-community/ui-drawer/svelte';
import CollectionViewElement from '@nativescript-community/ui-collectionview/svelte';
import { install } from '@nativescript-community/ui-drawer';

import BasicDrawer from './BasicDrawer.svelte';
import AllSides from './AllSides.svelte';
import SwipeMenu from './SwipeMenu.svelte';

export function installPlugin() {
    DrawerElement.register();
    CollectionViewElement.register();
    install();
}

export const demos = [
    { name: 'Basic Drawer', path: 'basic', component: BasicDrawer },
    { name: 'All Sides', path: 'all-sides', component: AllSides },
    { name: 'Swipe Menu', path: 'swipe-menu', component: SwipeMenu }
];
