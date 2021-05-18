import Demo1 from './Demo1.svelte';
import Demo2 from './Demo2.svelte';
import Development from './Development.svelte';

import * as drawer from '@nativescript-community/ui-drawer';
install();

import DrawerElement from '@nativescript-community/ui-drawer/svelte';

export function install() {
    drawer.install();
    DrawerElement.register();
}

export const demos = [
    { name: 'Demo 1', path: "demo1", component: Demo1 },
    { name: 'Demo 2', path: "demo2", component: Demo2 },
    { name: 'Development', path: "development", component: Development }
];
