import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';

import { DrawerModule } from '@nativescript-community/ui-drawer/angular';

import { BasicDrawerComponent } from './basic-drawer/basic-drawer.component';
import { AllSidesComponent } from './all-sides/all-sides.component';

export const COMPONENTS = [BasicDrawerComponent, AllSidesComponent];
@NgModule({
    imports: [DrawerModule],
    exports: [DrawerModule],
    schemas: [NO_ERRORS_SCHEMA]
})
export class InstallModule {}

export function installPlugin() {}

export const demos = [
    { name: 'Basic Drawer', path: 'basic-drawer', component: BasicDrawerComponent },
    { name: 'All Sides', path: 'all-sides', component: AllSidesComponent }
];
