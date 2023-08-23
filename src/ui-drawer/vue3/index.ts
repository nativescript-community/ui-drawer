import { Drawer as NativeDrawer } from '..';
import { install } from '../index';

const DrawerPlugin = {
    install(app: any) {
        console.log('DrawerPlugin install');
        console.log('DrawerPlugin registerElement', NativeDrawer);
        install();
        app.registerElement('Drawer', () => NativeDrawer, {
            overwriteExisting: true,
            nodeOps: {
                insert(child, parent) {
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
                },
                delete(child, parent) {
                    parent.deleteChild(child);
                }
            }
        });
        console.log('DrawerPlugin registerElement done');
        // app.component('Drawer', DrawerComp); // note: this is actually not used...
    }
};

export default DrawerPlugin;
