import Vue from 'nativescript-vue';

import * as drawer from '@nativescript-community/ui-drawer';
install();

import DrawerPlugin from '@nativescript-community/ui-drawer/vue';

import Demo1 from './Demo1.vue';
import Demo2 from './Demo2.vue';
import Development from './Development.vue';

export function install() {
    drawer.install();
    Vue.use(DrawerPlugin);
}

export const demos = [
    { name: 'Demo 1', path: "demo1", component: Demo1 },
    { name: 'Demo 2', path: "demo2", component: Demo2 },
    { name: 'Development', path: "development", component: Development }
];