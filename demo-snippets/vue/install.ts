import Vue from 'nativescript-vue';

import { install } from '@nativescript-community/ui-drawer';
import DrawerPlugin from '@nativescript-community/ui-drawer/vue';
import CollectionViewElement from '@nativescript-community/ui-collectionview/vue';

import BasicDrawer from './BasicDrawer.vue';
import AllSides from './AllSides.vue';
import SwipeMenu from './SwipeMenu.vue';

export function installPlugin() {
    Vue.use(DrawerPlugin);
    Vue.use(CollectionViewElement);
    install();
}

export const demos = [
    { name: 'Basic Drawer', path: 'basic', component: BasicDrawer },
    { name: 'All Sides', path: 'all-sides', component: AllSides },
    { name: 'Swipe Menu', path: 'swipe-menu', component: SwipeMenu }
];
