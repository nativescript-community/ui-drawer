import { defineComponent, h, ref } from 'nativescript-vue';

export const DrawerComp = defineComponent({
    setup() {
        const drawer = ref();
        const open = (side) => drawer.value.nativeView.open(side);
        const close = (side) => drawer.value.nativeView.close(side);
        const isOpened = (side) => drawer.value.nativeView.isOpened(side);
        const toggle = (side) => drawer.value.nativeView.toggle(side);
        return () =>
            h('NativeDrawer', {
                ref: drawer,
                open,
                close,
                isOpened,
                toggle
            });
    }
});
