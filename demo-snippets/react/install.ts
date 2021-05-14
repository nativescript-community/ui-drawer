import { register } from '@nativescript-community/plugin-seed/react';

import { Demo1 } from './Demo1';
import { Demo2 } from './Demo2';
import { Development } from './Development';

export function install() {
    register();
}

export const demos = [
    { name: 'Demo 1', path: 'demo1', component: Demo1 },
    { name: 'Demo 2', path: 'demo2', component: Demo2 },
    { name: 'Development', path: 'development', component: Development }
];
