import { NativeViewElementNode, registerElement } from 'svelte-native/dom';
import { Drawer, Side } from '../';

export default class DrawerElement extends NativeViewElementNode<Drawer> {
    constructor() {
        super('drawer', Drawer);
    }

    private get _drawer() {
        return this.nativeView;
    }

    close(side?: Side) {
        this._drawer.close(side);
    }

    isOpened(side?: Side): boolean {
        return this._drawer.isOpened(side);
    }

    open(side?: Side) {
        this._drawer.open(side);
    }

    toggle(side?: Side) {
        this._drawer.toggle(side);
    }

    static register() {
        registerElement('drawer', () => new DrawerElement());
    }
}
