import DrawerComp from './component';

const DrawerPlugin = {
    install(Vue) {
        Vue.registerElement('Drawer', () => require('../index').Drawer, {
            component: DrawerComp
        });
    }
};

export default DrawerPlugin;
