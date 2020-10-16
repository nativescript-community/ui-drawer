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
import { Animation, EventData, GridLayout, Property, Utils, View, booleanConverter } from '@nativescript/core';
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
    backdropColor = 'rgba(0, 0, 0, 0.7)';

    isAnimating = false;
    prevDeltaX = 0;
    viewWidth: { [k in Side]: number } = { left: 0, right: 0 };
    translationX: { [k in Side]: number } = { left: 0, right: 0 };
    isPanEnabled: boolean = true;
    panGestureHandler: PanGestureHandler;
    nativeGestureHandler: PanGestureHandler;
    showingSide: Side = null;

    gestureEnabled = true;
    modes: { [k in Side]: Mode } = { left: 'under', right: 'slide' };

    constructor() {
        super();
        this.backDrop = new GridLayout();
        this.backDrop.backgroundColor = this.backdropColor;
        this.backDrop.opacity = 0;
        this.backDrop.visibility = 'hidden';
        this.backDrop.on('tap', () => this.close(), this);
        this.addChild(this.backDrop);
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
                waitFor: [PAN_GESTURE_TAG]
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
            if (index !== indexBack - 1) {
                this.removeChild(newValue);
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

    public _onDrawerContentChanged(side: Side, oldValue: View, newValue: View) {
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
            if (mode === 'under') {
                const indexBack = this.getChildIndex(this.backDrop);
                const index = this.getChildIndex(newValue);
                // console.log('_onDrawerContentChanged', side, newValue, newValue.parent, indexBack, index);
                if (index > indexBack - 1) {
                    this.removeChild(newValue);
                    this.insertChild(newValue, Math.max(indexBack - 1, 0));
                }
            } else {
                const indexBack = this.getChildIndex(this.backDrop);
                const index = this.getChildIndex(newValue);
                if (index <= indexBack) {
                    this.removeChild(newValue);
                    this.insertChild(newValue, indexBack + 1);
                }
            }
        }
    }

    computeTranslationData(side, value) {
        const width = this.viewWidth[side];
        const delta = Math.max(width - value, 0);
        if (this.modes[side] === 'under') {
            return {
                mainContent: {
                    translateX: width - value,
                },
                [side + 'Drawer']: {
                    translateX: 0,
                },
                backDrop: {
                    translateX: width - value,
                    opacity: delta / width,
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
                    opacity: delta / width,
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
            this.applyTrData(data, side);
        } else {
            const shown = this.viewWidth[side] - this.translationX[side];
            this.viewWidth[side] = width;
            const data = this.computeTranslationData(side, width - shown);
            this.translationX[side] = width - shown;
            this.applyTrData(data, side);
        }
    }

    onNativeGestureState(args: GestureStateEventData) {
        const { state } = args.data;
        if (state === GestureState.ACTIVE) {
            this.panGestureHandler.cancel();
        }
    }
    needToSetSide: Side;
    onGestureState(args: GestureStateEventData) {
        const { state, prevState, extraData, view } = args.data;
        // console.log('onGestureState', state, this.showingSide, this.needToSetSide);
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
            } else if (this.rightDrawer && !this.showingSide && extraData.x >= width - this.rightSwipeDistance) {
                this.needToSetSide = 'right';
            }
            this.backDrop.visibility = 'visible';
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
            this.backDrop.visibility= 'visible';
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
        // console.log('animateToPosition', side, width, trData);
        this.translationX[side] = width - position;
        if (position !== 0) {
            this.showingSide = side;
            this.backDrop.visibility = 'visible';
            this.notify({ eventName: 'open', side, duration } as DrawerEventData);
        } else {
            this.showingSide = null;
            this.notify({ eventName: 'close', side, duration } as DrawerEventData);
        }
        await new Animation(
            Object.keys(trData).map((k) =>
                Object.assign(
                    {
                        target: this[k],
                        curve: AnimationCurve.easeInOut,
                        duration,
                    },
                    transformAnimationValues(trData[k])
                )
            )
        ).play();
        if (position !== 0) {
        } else {
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
        console.log('toggle', side, this.showingSide);
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
leftDrawerContentProperty.register(Drawer);
rightDrawerContentProperty.register(Drawer);
gestureEnabledProperty.register(Drawer);
