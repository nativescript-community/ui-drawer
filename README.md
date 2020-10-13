# Welcome to NativeScript drawer plugin

> A NativeScript Plugin for Android apps.

[![Build Status](https://travis-ci.org/@nativescript-community/ui-drawer.svg?branch=master)](https://travis-ci.org/@nativescript-community/ui-drawer)
[![npm](https://img.shields.io/npm/v/@nativescript-community/ui-drawer.svg)](https://www.npmjs.com/package/@nativescript-community/ui-drawer)
[![npm](https://img.shields.io/npm/dt/@nativescript-community/ui-drawer.svg?label=npm%20downloads)](https://www.npmjs.com/package/@nativescript-community/ui-drawer)
[![Dependency status](https://david-dm.org/@nativescript-community/ui-drawer.svg)](https://david-dm.org/@nativescript-community/ui-drawer)
[![peerDependencies Status](https://david-dm.org/@nativescript-community/ui-drawer/peer-status.svg)](https://david-dm.org/@nativescript-community/ui-drawer?type=peer)

## install

```
tns plugin add @nativescript-community/ui-drawer
```

## usage

### Core

```xml
<Page xmlns:nsDrawer="@nativescript-community/ui-drawer" xmlns="http://www.nativescript.org/tns.xsd">
    <nsDrawer:RadSideDrawer id="sideDrawer">
      <nsDrawer:RadSideDrawer.leftDrawer>
        <GridLayout width="200"/>
      </nsDrawer:RadSideDrawer.leftDrawer>
      <nsDrawer:RadSideDrawer.rightDrawer>
        <GridLayout width="69%"/>
      </nsDrawer:RadSideDrawer.rightDrawer>
      <nsDrawer:RadSideDrawer.mainContent>
        <GridLayout />
      </nsDrawer:RadSideDrawer.mainContent>
    </nsDrawer:RadSideDrawer>
</navigation:ExamplePage>
```

### Vue
register with

```typescript
import DrawerPlugin from '~/components/drawer/vue';
Vue.use(DrawerPlugin);
````

then use:

```xml
<Drawer>
  <StackLayout ~leftDrawer />
  <StackLayout ~rightDrawer />
  <StackLayout ~mainContent />
</Drawer>
```

### Angular
register with

```typescript
import { DrawerModule } from "@nativescript-community/ui-drawer/angular";
@NgModule({
    imports: [
        DrawerModule
    ]
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
````

then use:

```xml
<Drawer>
    <GridLayout tkLeftDrawer width="70%">
    </GridLayout>

    <GridLayout tkRightDrawer width="200">
    </GridLayout>

    <page-router-outlet tkMainContent></page-router-outlet>
</Drawer>
```
