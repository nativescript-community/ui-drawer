import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';

import { DrawerModule } from "@nativescript-community/ui-drawer/angular";

import { SimpleDrawerComponent } from './simple-drawer/simple-drawer.component';
import { AllSidesComponent } from './all-sides/all-sides.component';
import { DevelopmentComponent } from './development/development.component';

export const COMPONENTS = [SimpleDrawerComponent, AllSidesComponent, DevelopmentComponent];
@NgModule({
    imports: [DrawerModule],
    exports: [DrawerModule],
    schemas: [NO_ERRORS_SCHEMA]
})
export class InstallModule {}

export function install() { }

export const demos = [
    { name: 'Simple Drawer', path: 'simple-drawer', component: SimpleDrawerComponent },
    { name: 'All Sides', path: 'all-sides', component: AllSidesComponent },
    { name: 'Development', path: 'development', component: DevelopmentComponent }
];

