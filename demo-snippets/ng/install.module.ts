import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';

import { NativeScriptVersionNumberModule } from '@nativescript-community/plugin-seed/angular';

import { Demo1Component } from './demo1/demo1.component';
import { Demo2Component } from './demo2/demo2.component';
import { DevelopmentComponent } from './development/development.component';

export const COMPONENTS = [Demo1Component, Demo2Component, DevelopmentComponent];
@NgModule({
    imports: [NativeScriptVersionNumberModule],
    exports: [NativeScriptVersionNumberModule],
    schemas: [NO_ERRORS_SCHEMA]
})
export class InstallModule {}

export function install() { }

export const demos = [
    { name: 'Demo 1', path: 'demo1', component: Demo1Component },
    { name: 'Demo 2', path: 'demo2', component: Demo2Component },
    { name: 'Development', path: 'development', component: DevelopmentComponent }
];

