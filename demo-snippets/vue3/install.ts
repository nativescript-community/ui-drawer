import DrawerPlugin from '@nativescript-community/ui-drawer/vue3';
import { install } from '@nativescript-community/ui-drawer';

import BasicDrawer from './BasicDrawer.vue';
import AllSides from './AllSides.vue';

export function installPlugin(app: any) {
    console.log('installPlugin');
    app.use(DrawerPlugin);
}

export const demos = [
    { name: 'Basic Drawer', path: 'basic', component: BasicDrawer },
    { name: 'All Sides', path: 'all-sides', component: AllSides }
];
