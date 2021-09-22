# NativeScript Drawer

NativeScript plugin that allows you to easily add a side drawer (side menu) to your projects. This can be used as an Open Source alternative to [RadSideDrawer](https://docs.nativescript.org/ui/components/sidedrawer/overview).

[![npm](https://img.shields.io/npm/v/@nativescript-community/ui-drawer.svg)](https://www.npmjs.com/package/@nativescript-community/ui-drawer)
[![npm downloads](https://img.shields.io/npm/dm/@nativescript-community/ui-drawer.svg)](https://www.npmjs.com/package/@nativescript-community/ui-drawer)
[![npm downloads](https://img.shields.io/npm/dt/@nativescript-community/ui-drawer.svg)](https://www.npmjs.com/package/@nativescript-community/ui-drawer)

| <img src="images/demo-ios.gif" height="500" /> | <img src="images/demo-android.gif" height="500" /> |
| --- | ----------- |
| iOS Demo | Android Demo |

---
## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [API](#api)
4. [Usage in Angular](#usage-in-angular)
5. [Usage in Vue](#usage-in-vue)
6. [Usage in Svelte](#usage-in-svelte)
7. [Usage in React](#usage-in-react)
8. [Demos and Development](#demos-and-development)

## Installation

```
ns plugin add @nativescript-community/ui-drawer
```

## Configuration
For gestures to work, make sure to add the following code block inside the main application file (e.g. app.ts):

```typescript
import { install } from '@nativescript-community/ui-drawer';
install();
```

## API

### Properties

| Property            | Default                           | Type                        | Description                                             |
| ------------------- | --------------------------------- | --------------------------- | ------------------------------------------------------- |
| leftDrawer          | `undefined`                       | `View`                      | View containing the content for the left side drawer    |
| rightDrawer         | `undefined`                       | `View`                      | View containing the content for the right side drawer   |
| topDrawer          | `undefined`                       | `View`                      | View containing the content for the top side drawer    |
| bottomDrawer         | `undefined`                       | `View`                      | View containing the content for the bottom side drawer   |
| mainContent         | `undefined`                       | `View`                      | View containing the main content of the app             |
| gestureEnabled      | `true`                            | `boolean`                   | Boolean setting if swipe gestures are enabled           |
| backdropColor       | `new Color('rgba(0, 0, 0, 0.7)')` | `Color`                     | The color of the backdrop behind the drawer             |
| leftDrawerMode      | `slide`                           | `Mode ('under' or 'slide')` | The color of the backdrop behind the drawer             |
| rightDrawerMode     | `slide`                           | `Mode ('under' or 'slide')` | The color of the backdrop behind the drawer             |
| gestureMinDist     | `10`                           | number | The min "swipe" distance to trigger the menu gesture             |
| leftSwipeDistance     | `40`                           | number | The "left" zone size from where the gesture is recognized             |
| rightSwipeDistance     | `40`                           | number | The "right" zone size from where the gesture is recognized             |
| topSwipeDistance     | `40`                           | number | The "top" zone size from where the gesture is recognized             |
| bottomSwipeDistance     | `40`                           | number | The "bottom" zone size from where the gesture is recognized             |
| leftOpenedDrawerAllowDraging     | `true`                           | boolean | Allow dragging the opened menu             |
| rightOpenedDrawerAllowDraging     | `true`                           | boolean | Allow dragging the opened menu             |
| topOpenedDrawerAllowDraging     | `true`                           | boolean | Allow dragging the opened menu             |
| bottomOpenedDrawerAllowDraging     | `true`                           | boolean | Allow dragging the opened menu             |



### Methods

| Name         | Return | Description                                     |
| ------------ | ------ | ----------------------------------------------- |
| open()       | `void` | Programatically open the drawer                 |
| close()      | `void` | Programatically close the drawer                |
| toggle()     | `void` | Programatically toggle the state of the drawer  |
| install()    | `void` | Install gestures                                |

### Events

| Name      | Event Data         | Description                  |
| --------- | ------------------ | ---------------------------- |
| open      | `side`, `duration` | Drawer opens                 |
| close     | `side`, `duration` | Drawer closes                |

## Usage in Angular
Import the module into your project.

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
```

### Examples:

- [Basic Drawer](demo-snippets/ng/basic-drawer)
  - A basic sliding drawer.
- [All Sides](demo-snippets/ng/all-sides)
  - An example of drawers on all sides: left, right, top, bottom.


## Usage in React

Register the plugin in your `app.ts`.

```typescript
import DrawerElement from '@nativescript-community/ui-drawer/react';
DrawerElement.register();
```

### Examples:

- [Basic Drawer](demo-snippets/react/BasicDrawer.tsx)
  - A basic sliding drawer.
- [All Sides](demo-snippets/react/AllSides.tsx)
  - An example of drawers on all sides: left, right, top, bottom.

## Usage in Svelte

Register the plugin in your `app.ts`.

```typescript
import DrawerElement from '@nativescript-community/ui-drawer/svelte';
DrawerElement.register();
```

### Examples:

- [Basic Drawer](demo-snippets/svelte/BasicDrawer.svelte)
  - A basic sliding drawer.
- [All Sides](demo-snippets/svelte/AllSides.svelte)
  - An example of drawers on all sides: left, right, top, bottom.

## Usage in Vue

Register the plugin in your `app.js`.

```typescript
import DrawerPlugin from '@nativescript-community/ui-drawer/vue'
Vue.use(DrawerPlugin);
```

### Examples:

- [Basic Drawer](demo-snippets/vue/BasicDrawer.vue)
  - A basic sliding drawer.
- [All Sides](demo-snippets/vue/AllSides.vue)
  - An example of drawers on all sides: left, right, top, bottom.

## Demos and Development

To run the demos, you must clone this repo **recursively**.

```
git clone https://github.com/nativescript-community/ui-drawer.git --recursive
```

### Install Dependencies:
```bash
npm i # or 'yarn install' or 'pnpm install'
```

### Interactive Menu:
To start the interactive menu, run `npm start` (or `yarn start` or `pnpm start`). This will list all of the commonly used scripts.

### Building Plugin:
```bash
npm run build

# or for Angular
npm run build.angular
```

### Running Demos:
```bash
npm run demo.[ng|react|svelte|vue].[ios|android]

# Example:
npm run demo.svelte.ios
```