import Vue from 'nativescript-vue';
import VersionNumber from '@nativescript-community/plugin-seed/vue';

import Demo1 from './Demo1.vue';
import Demo2 from './Demo2.vue';
import Development from './Development.vue';

export function install() {
    Vue.use(VersionNumber);
}

export const demos = [
    { name: 'Demo 1', path: "demo1", component: Demo1 },
    { name: 'Demo 2', path: "demo2", component: Demo2 },
    { name: 'Development', path: "development", component: Development }
];