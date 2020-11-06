import {
    GestureHandlerStateEvent,
    GestureHandlerTouchEvent,
    GestureState,
    GestureStateEventData,
    GestureTouchEventData,
    HandlerType,
    Manager,
    PanGestureHandler,
    install as installGestures,
} from '@nativescript-community/gesturehandler';
import { Animation, AnimationDefinition, Color, EventData, GridLayout, Property, Utils, View, booleanConverter } from '@nativescript/core';
import { AnimationCurve } from '@nativescript/core/ui/enums';
installGestures(false);
const OPEN_DURATION = 200;
const CLOSE_DURATION = 200;
export const PAN_GESTURE_TAG = 12431;
export const NATIVE_GESTURE_TAG = 12421;
const DEFAULT_TRIGGER_WIDTH = 20;
const SWIPE_DISTANCE_MINIMUM = 10;

function transformAnimationValues(values) {
    values.translate = { x: values.translateX || 0, y: values.translateY || 0 };
    values.scale = { x: values.scaleX || 1, y: values.scaleY || 1 };
    delete values.translateX;
    delete values.translateY;
    delete values.scaleX;
    delete values.scaleY;
    return values;
}

export type Side = 'left' | 'right';
export type Mode = 'under' | 'slide';
export interface DrawerEventData extends EventData {
    side: Side;
    duration?: number;
}

export const leftDrawerContentProperty = new Property<Drawer, View>({
    name: 'leftDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => {
        target._onDrawerContentChanged('left', oldValue, newValue);
    },
});
export const rightDrawerContentProperty = new Property<Drawer, View>({
    name: 'rightDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => {
        target._onDrawerContentChanged('right', oldValue, newValue);
    },
});
export const gestureEnabledProperty = new Property<Drawer, boolean>({
    name: 'gestureEnabled',
    defaultValue: true,
    valueConverter: booleanConverter,
});
export const backdropColorProperty = new Property<Drawer, Color>({
    name: 'backdropColor',
    valueConverter: (c) => (c ? new Color(c) : null),
});
export const leftDrawerModeProperty = new Property<Drawer, Mode>({
    name: 'leftDrawerMode',
});
export const rightDrawerModeProperty = new Property<Drawer, Mode>({
    name: 'rightDrawerMode',
});
export const translationFunctionProperty = new Property<Drawer, Function>({
    name: 'translationFunction',
});

@CSSType('Drawer')
export class Drawer extends GridLayout {
    public leftDrawer: View;
    public rightDrawer: View;
    public mainContent: View;
    public backDrop: View;

    isPanning = false;
    leftSwipeDistance = 30;
    rightSwipeDistance = 30;
    hasRightMenu = false;
    openingProgress = 0;
    backdropColor = new Color('rgba(0, 0, 0, 0.7)');

    isAnimating = false;
    prevDeltaX = 0;
    viewWidth: { [k in Side]: number } = { left: 0, right: 0 };
    translationX: { [k in Side]: number } = { left: 0, right: 0 };
    isPanEnabled: boolean = true;
    panGestureHandler: PanGestureHandler;
    nativeGestureHandler: PanGestureHandler;
    showingSide: Side = null;
    needToSetSide: Side;

    gestureEnabled = true;
    modes: { [k in Side]: Mode } = { left: 'slide', right: 'slide' };
    translationFunction?: (
        side: Side,
        width: number,
        delta: number,
        progress: number
    ) => { leftDrawer?: AnimationDefinition; rightDrawer?: AnimationDefinition; backDrop?: AnimationDefinition; mainContent?: AnimationDefinition };

    constructor() {
        super();
        this.backDrop = new GridLayout();
        this.backDrop.backgroundColor = this.backdropColor;
        this.backDrop.opacity = 0;
        this.backDrop.visibility = 'hidden';
        this.backDrop.on('tap', () => this.close(), this);
        this.insertChild(this.backDrop, 0);
        // console.log('Drawer constructor', this.backDrop, this.getChildIndex(this.backDrop));
    }
    initGestures() {
        const manager = Manager.getInstance();
        const gestureHandler = manager.createGestureHandler(HandlerType.PAN, PAN_GESTURE_TAG, {
            // waitFor: [PAN_GESTURE_TAG],
            // disallowInterruption: true,
            shouldCancelWhenOutside: true,
            activeOffsetX: SWIPE_DISTANCE_MINIMUM,
            minDist: SWIPE_DISTANCE_MINIMUM,
            failOffsetX: -SWIPE_DISTANCE_MINIMUM,
        });
        gestureHandler.on(GestureHandlerTouchEvent, this.onGestureTouch, this);
        gestureHandler.on(GestureHandlerStateEvent, this.onGestureState, this);
        gestureHandler.attachToView(this);
        this.panGestureHandler = gestureHandler as any;
        if (this.mainContent) {
            this.initNativeGestureHandler(this.mainContent);
        }
    }
    initNativeGestureHandler(newValue: View) {
        if (!this.nativeGestureHandler) {
            const manager = Manager.getInstance();
            const gestureHandler = manager.createGestureHandler(HandlerType.NATIVE_VIEW, NATIVE_GESTURE_TAG, {
                waitFor: [PAN_GESTURE_TAG],
            });
            gestureHandler.on(GestureHandlerStateEvent, this.onNativeGestureState, this);
            this.nativeGestureHandler = gestureHandler as any;
        }
        if (this.nativeGestureHandler.getView() !== newValue) {
            this.nativeGestureHandler.attachToView(newValue);
        }
    }
    initNativeView() {
        super.initNativeView();
        if (this.gestureEnabled) {
            this.initGestures();
        }
    }
    [gestureEnabledProperty.setNative](value) {
        if (this.panGestureHandler) {
            this.panGestureHandler.enabled = value;
        } else if (value && !this.panGestureHandler) {
            this.initGestures();
        }
    }
    [backdropColorProperty.setNative](value: Color) {
        this.backDrop.backgroundColor = value;
    }
    [leftDrawerModeProperty.setNative](value: Mode) {
        const oldValue = this.modes['left'];
        this.modes['left'] = value;
        this.onSideModeChanged('left', value, oldValue);
    }
    [rightDrawerModeProperty.setNative](value: Mode) {
        const oldValue = this.modes['right'];
        this.modes['right'] = value;
        this.onSideModeChanged('right', value, oldValue);
    }
    disposeNativeView() {
        super.disposeNativeView();
        if (this.panGestureHandler) {
            this.panGestureHandler.off(GestureHandlerTouchEvent, this.onGestureTouch, this);
            this.panGestureHandler.off(GestureHandlerStateEvent, this.onGestureState, this);
            this.panGestureHandler.detachFromView(this);
            // this.panGestureHandler.detachFromView(this.$refs['gestureView'].nativeView);
            this.panGestureHandler = null;
        }
    }
    public _onMainContentChanged(oldValue: View, newValue: View) {
        // console.log('_onMainContentChanged', oldValue, newValue);
        if (oldValue) {
            if (this.nativeGestureHandler) {
                this.nativeGestureHandler.detachFromView(oldValue);
            }
            this.removeChild(oldValue);
        }

        if (newValue) {
            const indexBack = this.getChildIndex(this.backDrop);
            const index = this.getChildIndex(newValue);
            this.initNativeGestureHandler(newValue);
            // console.log('_onMainContentChanged', newValue, indexBack, index);
            if (index !== indexBack - 1 && newValue.parent === this) {
                this.removeChild(newValue);
                this.insertChild(newValue, indexBack);
            } else {
                this.insertChild(newValue, indexBack);
            }
        }
    }

    onLeftLayoutChanged(event: EventData) {
        return this.onLayoutChange('left', event);
    }

    onRightLayoutChanged(event: EventData) {
        return this.onLayoutChange('right', event);
    }
    addChild(child) {
        // for now we ignore this
        // to make sure we add the view in the property change
        // this is to make sure the view does not get "visible" too quickly
        // before we apply the translation
        // super.addChild(child);
    }
    public _onDrawerContentChanged(side: Side, oldValue: View, newValue: View) {
        // console.log('_onDrawerContentChanged', side, oldValue, newValue);
        if (oldValue) {
            if (side === 'right') {
                newValue.off('layoutChanged', this.onRightLayoutChanged, this);
            } else {
                newValue.off('layoutChanged', this.onLeftLayoutChanged, this);
            }
            this.removeChild(oldValue);
        }

        if (newValue) {
            // newValue.columns = "auto"
            newValue.horizontalAlignment = side;
            if (side === 'right') {
                newValue.on('layoutChanged', this.onRightLayoutChanged, this);
            } else {
                newValue.on('layoutChanged', this.onLeftLayoutChanged, this);
            }
            const mode = this.modes[side];
            newValue.visibility = 'hidden';
            // this.addChild(newValue);
            this.onSideModeChanged(side, mode, undefined);
        }
    }
    onSideModeChanged(side: Side, mode: Mode, oldMode: Mode) {
        if ((oldMode && oldMode === mode) || (oldMode && oldMode !== 'under' && mode !== 'under')) {
            return;
        }
        const drawer = side === 'left' ? this.leftDrawer : this.rightDrawer;
        // console.log('onSideModeChanged', side, drawer);
        if (mode === 'under') {
            const indexBack = this.getChildIndex(this.backDrop);
            const index = this.getChildIndex(drawer);
            if (index > indexBack - 1 && drawer.parent === this) {
                this.removeChild(drawer);
                this.insertChild(drawer, Math.max(indexBack - 1, 0));
            } else {
                // initial addition
                drawer.visibility = 'hidden';
                this.insertChild(drawer, 0);
            }
        } else {
            const indexBack = this.getChildIndex(this.backDrop);
            const index = this.getChildIndex(drawer);
            if (index <= indexBack && drawer.parent === this) {
                this.removeChild(drawer);
                this.insertChild(drawer, indexBack + 1);
            } else {
                // initial addition
                drawer.visibility = 'hidden';
                this.insertChild(drawer, indexBack + 1);
            }
        }
    }
    computeTranslationData(side, value) {
        const width = this.viewWidth[side];
        const delta = Math.max(width - value, 0);
        const progress = delta / width;
        if (this.translationFunction) {
            return this.translationFunction(side, width, delta, progress);
        }
        if (this.modes[side] === 'under') {
            return {
                mainContent: {
                    translateX: delta,
                },
                [side + 'Drawer']: {
                    translateX: 0,
                },
                backDrop: {
                    translateX: delta,
                    opacity: progress,
                },
            };
        } else {
            return {
                mainContent: {
                    translateX: 0,
                },
                [side + 'Drawer']: {
                    translateX: side === 'left' ? -value : value,
                },
                backDrop: {
                    translateX: 0,
                    opacity: progress,
                },
            };
        }
    }
    onLayoutChange(side: Side, event: EventData) {
        const contentView = event.object as GridLayout;
        const width = Math.round(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredWidth()));
        // console.log('onLayoutChange', side, width);
        if (this.translationX[side] === 0) {
            this.viewWidth[side] = width;
            const data = this.computeTranslationData(side, width);
            this.translationX[side] = width;
            // delay applyTrData or it will create a layout issue on iOS
            setTimeout(() => this.applyTrData(data, side), 0);
        } else {
            const shown = this.viewWidth[side] - this.translationX[side];
            this.viewWidth[side] = width;
            const data = this.computeTranslationData(side, width - shown);
            this.translationX[side] = width - shown;
            // delay applyTrData or it will create a layout issue on iOS
            setTimeout(() => this.applyTrData(data, side), 0);
        }
    }

    onNativeGestureState(args: GestureStateEventData) {
        const { state } = args.data;
        if (state === GestureState.ACTIVE) {
            this.panGestureHandler.cancel();
        }
    }
    onGestureState(args: GestureStateEventData) {
        const { state, prevState, extraData, view } = args.data;
        // console.log('onGestureState', prevState, state, this.showingSide, this.needToSetSide);
        if (state === GestureState.BEGAN) {
            const width = Utils.layout.toDeviceIndependentPixels(this.getMeasuredWidth());
            if (
                !this.showingSide &&
                (!this.isPanEnabled ||
                    (!this.leftDrawer && !this.rightDrawer) ||
                    (this.leftDrawer && extraData.x > this.leftSwipeDistance && (!this.rightDrawer || extraData.x < width - this.rightSwipeDistance)) ||
                    (this.rightDrawer && extraData.x < width - this.rightSwipeDistance && (!this.leftDrawer || extraData.x > this.leftSwipeDistance)))
            ) {
                // console.log('cancelling gesture');
                args.object.cancel();
                return;
            }
        }
        if (state === GestureState.ACTIVE) {
            const width = this.getMeasuredWidth();
            if (this.leftDrawer && !this.showingSide && extraData.x <= this.leftSwipeDistance) {
                this.needToSetSide = 'left';
                this.leftDrawer.visibility = 'visible';
            } else if (this.rightDrawer && !this.showingSide && extraData.x >= width - this.rightSwipeDistance) {
                this.needToSetSide = 'right';
                this.rightDrawer.visibility = 'visible';
            }
            // console.log('show backDrop');
            // this.backDrop.visibility = 'visible';
        }
        this.updateIsPanning(state);
        if (!this.isPanEnabled) {
            return;
        }

        if (prevState === GestureState.ACTIVE) {
            this.needToSetSide = null;
            if (!this.showingSide) {
                return;
            }
            const { velocityX, translationX } = extraData;
            const viewX = this.translationX[this.showingSide] - this.viewWidth[this.showingSide];

            const dragToss = 0.05;
            const x = translationX - this.prevDeltaX;
            const totalDelta = x + dragToss * velocityX;

            let destSnapPoint = 0;

            if (this.showingSide === 'left') {
                if (totalDelta < -DEFAULT_TRIGGER_WIDTH) {
                    destSnapPoint = 0;
                } else if (totalDelta > DEFAULT_TRIGGER_WIDTH) {
                    destSnapPoint = this.viewWidth[this.showingSide];
                } else {
                    const endOffsetX = viewX + totalDelta;
                    const progress = Math.abs(endOffsetX / this.viewWidth[this.showingSide]);
                    destSnapPoint = progress > 0.5 ? this.viewWidth[this.showingSide] : 0;
                }
            } else if (this.showingSide === 'right') {
                if (-totalDelta < -DEFAULT_TRIGGER_WIDTH) {
                    destSnapPoint = 0;
                } else if (-totalDelta > DEFAULT_TRIGGER_WIDTH) {
                    destSnapPoint = this.viewWidth[this.showingSide];
                } else {
                    const endOffsetX = viewX + totalDelta;
                    const progress = Math.abs(endOffsetX / this.viewWidth[this.showingSide]);
                    destSnapPoint = progress > 0.5 ? this.viewWidth[this.showingSide] : 0;
                }
            }
            this.animateToPosition(this.showingSide, destSnapPoint);
            this.prevDeltaX = 0;
        }
    }
    updateIsPanning(state: GestureState) {
        this.isPanning = state === GestureState.ACTIVE || state === GestureState.BEGAN;
    }
    onGestureTouch(args: GestureTouchEventData) {
        const data = args.data;
        const side = this.showingSide || this.needToSetSide;
        // console.log('onGestureTouch', data.state, side);
        if (data.state !== GestureState.ACTIVE || !side) {
            return;
        }
        const deltaX = data.extraData.translationX;
        if (this.isAnimating || !this.isPanning || !this.isPanEnabled || deltaX === 0) {
            this.prevDeltaX = deltaX;
            return;
        }
        if (this.needToSetSide) {
            this.showingSide = this.needToSetSide;
            this.needToSetSide = null;
            // (side === 'left' ? this.leftDrawer : this.rightDrawer).visibility = 'visible';
            // console.log('show backDrop');
            this.backDrop.visibility = 'visible';
        }
        const width = this.viewWidth[side];

        const viewX = this.translationX[side] - width;

        let x = deltaX - this.prevDeltaX;
        if (this.showingSide === 'left') {
            x = -x;
        }
        const trX = this.constrainX(this.showingSide, viewX + x);
        // console.log('onGestureTouch', x, side, deltaX, viewX + x, trX);

        this.translationX[side] = width + trX;
        const trData = this.computeTranslationData(side, width + trX);
        this.applyTrData(trData, side);
        this.updateIsPanning(data.state);
        this.prevDeltaX = deltaX;
    }

    applyTrData(trData: { [k: string]: any }, side: Side) {
        // console.log('applyTrData', trData);
        Object.keys(trData).forEach((k) => {
            if (this[k]) {
                Object.assign(this[k], trData[k]);
            }
        });
    }

    constrainX(side, x) {
        const width = this.viewWidth[side];
        if (x > 0) {
            return 0;
        } else if (x < -width) {
            return -width;
        }
        return x;
    }

    async animateToPosition(side, position, duration = OPEN_DURATION) {
        if (this.showingSide && side !== this.showingSide) {
            this.animateToPosition(this.showingSide, 0, duration);
        }
        const width = this.viewWidth[side];
        const trData = this.computeTranslationData(side, width - position);
        this.translationX[side] = width - position;
        if (position !== 0) {
            this.showingSide = side;
            (side === 'right' ? this.rightDrawer : this.leftDrawer).visibility = 'visible';
            // console.log('show backDrop');
            this.backDrop.visibility = 'visible';
            this.notify({ eventName: 'open', side, duration } as DrawerEventData);
        } else {
            this.showingSide = null;
            this.notify({ eventName: 'close', side, duration } as DrawerEventData);
        }
        const params = Object.keys(trData)
            .map(
                (k) =>
                    this[k] &&
                    Object.assign(
                        {
                            target: this[k],
                            curve: AnimationCurve.easeInOut,
                            duration,
                        },
                        transformAnimationValues(trData[k])
                    )
            )
            .filter((a) => !!a);
        // console.log('animateToPosition', side, width, trData, duration);
        try {
            await new Animation(params).play();
        } catch (err) {
            console.error(err);
        }
        if (position !== 0) {
        } else {
            // console.log('hide backDrop');
            this.backDrop.visibility = 'hidden';
        }
    }
    isSideOpened() {
        return !!this.showingSide;
    }

    isOpened(side?: Side) {
        if (side) {
            return this.showingSide === side;
        }
        return !!this.showingSide;
    }
    async toggle(side?: Side) {
        if (!side) {
            if (this.leftDrawer) {
                side = 'left';
            } else if (this.rightDrawer) {
                side = 'right';
            } else {
                return;
            }
        }
        if (this.isOpened(side)) {
            this.close(side);
        } else {
            this.open(side);
        }
    }
    async open(side?: Side) {
        if (!side) {
            if (this.leftDrawer) {
                side = 'left';
            } else if (this.rightDrawer) {
                side = 'right';
            } else {
                return;
            }
        }
        this.animateToPosition(side, this.viewWidth[side]);
    }
    async close(side?: Side) {
        if (!side) {
            if (this.showingSide) {
                side = this.showingSide;
            } else {
                return;
            }
        }
        this.showingSide = null;
        return this.animateToPosition(side, 0, CLOSE_DURATION);
    }
    get mainViewTranslationX() {
        if (!this.showingSide || this.modes[this.showingSide] !== 'slide') {
            return 0;
        }
        return this.viewWidth[this.showingSide] - this.translationX[this.showingSide];
    }
}

export const mainContentProperty = new Property<Drawer, View>({
    name: 'mainContent',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => {
        target._onMainContentChanged(oldValue, newValue);
    },
});

mainContentProperty.register(Drawer);
backdropColorProperty.register(Drawer);
leftDrawerContentProperty.register(Drawer);
rightDrawerContentProperty.register(Drawer);
gestureEnabledProperty.register(Drawer);
leftDrawerModeProperty.register(Drawer);
rightDrawerModeProperty.register(Drawer);
translationFunctionProperty.register(Drawer);

export function install() {
    installGestures();
}
