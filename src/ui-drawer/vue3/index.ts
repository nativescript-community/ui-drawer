import { GridLayout } from '@nativescript/core';
import { DrawerComp } from './component';
import { Drawer as NativeDrawer } from '..';
import { install } from '../index';

const DrawerPlugin = {
    install(app: any) {
        console.log('DrawerPlugin install');
        console.log('DrawerPlugin registerElement', NativeDrawer);
        install();
        app.registerElement('NativeDrawer', () => NativeDrawer, {
            viewFlags: 8,
            overwriteExisting: true,
            nodeOps: {
                insert(child, parent) {
                    console.log('DrawerPlugin insert');
                    if (child.nativeView['~mainContent'] === '') {
                        parent.nativeView.mainContent = child.nativeView;
                    } else if (child.nativeView['~leftDrawer'] === '') {
                        parent.nativeView.leftDrawer = child.nativeView;
                    } else if (child.nativeView['~rightDrawer'] === '') {
                        parent.nativeView.rightDrawer = child.nativeView;
                    } else if (child.nativeView['~topDrawer'] === '') {
                        parent.nativeView.topDrawer = child.nativeView;
                    } else if (child.nativeView['~bottomDrawer'] === '') {
                        parent.nativeView.bottomDrawer = child.nativeView;
                    }
                }
            }
        });
        console.log('DrawerPlugin registerElement done');
        app.component('Drawer', DrawerComp);
    }
};

export default DrawerPlugin;
