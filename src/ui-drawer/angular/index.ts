// External
import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';

import { DrawerComponent } from './module';
export { DrawerComponent } from './module';

@NgModule({
    imports: [DrawerComponent],
    exports: [DrawerComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class DrawerModule {}
