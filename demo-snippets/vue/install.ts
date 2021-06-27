import Vue from 'nativescript-vue';

import * as drawer from '@nativescript-community/ui-drawer';
install();

import DrawerPlugin from '@nativescript-community/ui-drawer/vue';

import CollectionViewPlugin from '@nativescript-community/ui-collectionview/vue';

import SimpleDrawer from './SimpleDrawer.vue';
import AllSides from './AllSides.vue';
import Development from './Development.vue';

export function install() {
    drawer.install();
    Vue.use(DrawerPlugin);
    Vue.use(CollectionViewPlugin);
}

export const demos = [
    { name: 'Simple Drawer', path: "simple-drawer", component: SimpleDrawer },
    { name: 'All Sides', path: "all-sides", component: AllSides },
    { name: 'Development', path: "development", component: Development }
];