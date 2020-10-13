import DrawerComp from './component';

const DrawerPlugin = {

  install(Vue) {
    Vue.registerElement(
      'Drawer',
      () => require('../Drawer').Drawer,
      {
        component: DrawerComp,
      }
    );
  }
};

export default DrawerPlugin;