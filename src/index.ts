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
import { Animation, AnimationDefinition, CSSType, Color, EventData, GridLayout, Property, Utils, View, booleanConverter } from '@nativescript/core';
import { AnimationCurve } from '@nativescript/core/ui/enums';
installGestures(false);
const OPEN_DURATION = 200;
const CLOSE_DURATION = 200;
export const PAN_GESTURE_TAG = 12431;
const DEFAULT_TRIGGER_WIDTH = 20;
const DEFAULT_TRIGGER_HEIGHT = 20;
const SWIPE_DISTANCE_MINIMUM = 70;

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
export type VerticalSide = 'bottom' | 'top';
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
export const topDrawerContentProperty = new Property<Drawer, View>({
    name: 'topDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => {
        target._onDrawerContentChanged('top', oldValue, newValue);
    },
});
export const bottomDrawerContentProperty = new Property<Drawer, View>({
    name: 'bottomDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => {
        target._onDrawerContentChanged('bottom', oldValue, newValue);
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
export const topDrawerModeProperty = new Property<Drawer, Mode>({
    name: 'topDrawerMode',
});
export const bottomDrawerModeProperty = new Property<Drawer, Mode>({
    name: 'bottomDrawerMode',
});
export const translationFunctionProperty = new Property<Drawer, Function>({
    name: 'translationFunction',
});

@CSSType('Drawer')
export class Drawer extends GridLayout {
    public leftDrawer?: View;
    public rightDrawer?: View;
    public bottomDrawer?: View;
    public topDrawer?: View;
    public mainContent: View;
    public backDrop: View;

    isPanning = false;
    panMinDist = SWIPE_DISTANCE_MINIMUM;
    leftSwipeDistance = 30;
    rightSwipeDistance = 30;
    bottomSwipeDistance = 30;
    topSwipeDistance = 30;
    hasRightMenu = false;
    openingProgress = 0;
    backdropColor = new Color('rgba(0, 0, 0, 0.7)');

    measureWidth: number;
    measureHeight: number;
    isAnimating = false;
    prevDeltaX = 0;
    prevDeltaY = 0;
    viewWidth: { [k in Side]: number } = { left: 0, right: 0 };
    viewHeight: { [k in VerticalSide]: number } = { bottom: 0, top: 0 };
    translationX: { [k in Side]: number } = { left: 0, right: 0 };
    translationY: { [k in VerticalSide]: number } = { bottom: 0, top: 0 };
    leftOpenedDrawerAllowDraging = true;
    rightOpenedDrawerAllowDraging = true;
    bottomOpenedDrawerAllowDraging = true;
    panGestureHandler: PanGestureHandler;
    showingSide: Side | VerticalSide = null;
    needToSetSide: Side | VerticalSide;

    gestureEnabled = true;
    modes: { [k in Side | VerticalSide]: Mode } = { left: 'slide', right: 'slide', bottom: 'slide', top: 'slide' };
    translationFunction?: (
        side: Side | VerticalSide,
        width: number,
        value: number,
        delta: number,
        progress: number
    ) => {
        leftDrawer?: AnimationDefinition;
        rightDrawer?: AnimationDefinition;
        bottomDrawer?: AnimationDefinition;
        topDrawer?: AnimationDefinition;
        backDrop?: AnimationDefinition;
        mainContent?: AnimationDefinition;
    };

    constructor() {
        super();
        this.isPassThroughParentEnabled = true;
        this.backDrop = new GridLayout();
        this.backDrop.backgroundColor = this.backdropColor;
        this.backDrop.opacity = 0;
        this.backDrop.visibility = 'hidden';

        this.insertChild(this.backDrop, 0);
    }
    onBackdropTap() {
        this.close();
    }
    initGestures() {
        const manager = Manager.getInstance();
        const gestureHandler = manager.createGestureHandler(HandlerType.PAN, PAN_GESTURE_TAG, {
            shouldStartGesture: this.shouldStartGesture.bind(this),
            minDist: this.panMinDist,
        });
        gestureHandler.on(GestureHandlerTouchEvent, this.onGestureTouch, this);
        gestureHandler.on(GestureHandlerStateEvent, this.onGestureState, this);
        gestureHandler.attachToView(this);
        this.panGestureHandler = gestureHandler as any;
    }
    shouldStartGesture(data) {
        const width = Math.round(Utils.layout.toDeviceIndependentPixels(this.getMeasuredWidth()));
        const height = Math.round(Utils.layout.toDeviceIndependentPixels(this.getMeasuredHeight()));
        const side = this.showingSide;
        if (side) {
            if (side === 'left' || side === 'right') {
                const viewWidth = this.viewWidth[side];
                if ((side === 'left' && data.x <= viewWidth) || (side === 'right' && data.x >= width - viewWidth)) {
                    return this[side + 'OpenedDrawerAllowDraging'];
                }
            } else {
                const viewHeight = this.viewHeight[side];
                if ((side === 'top' && data.y <= viewHeight) || (side === 'bottom' && data.y >= height - viewHeight)) {
                    return this[side + 'OpenedDrawerAllowDraging'];
                }
            }
            return this.backDrop.opacity !== 0;
        } else if (
            (this.leftDrawer && data.x <= this.leftSwipeDistance) ||
            (this.rightDrawer && data.x >= width - this.rightSwipeDistance) ||
            (this.bottomDrawer && data.y >= height - this.bottomSwipeDistance) ||
            (this.topDrawer && data.y <= this.topSwipeDistance)
        ) {
            return true;
        }
        return false;
    }
    initNativeView() {
        super.initNativeView();
        this.backDrop.on('tap', this.onBackdropTap, this);
        if (this.gestureEnabled) {
            this.initGestures();
        }
    }
    disposeNativeView() {
        super.disposeNativeView();
        this.backDrop.off('tap', this.onBackdropTap, this);
        if (this.panGestureHandler) {
            this.panGestureHandler.off(GestureHandlerTouchEvent, this.onGestureTouch, this);
            this.panGestureHandler.off(GestureHandlerStateEvent, this.onGestureState, this);
            this.panGestureHandler.detachFromView();
            this.panGestureHandler = null;
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
    [topDrawerModeProperty.setNative](value: Mode) {
        const oldValue = this.modes['top'];
        this.modes['top'] = value;
        this.onSideModeChanged('top', value, oldValue);
    }
    [bottomDrawerModeProperty.setNative](value: Mode) {
        const oldValue = this.modes['bottom'];
        this.modes['bottom'] = value;
        this.onSideModeChanged('bottom', value, oldValue);
    }
    public _onMainContentChanged(oldValue: View, newValue: View) {
        // console.log('_onMainContentChanged', oldValue, newValue);
        if (oldValue) {
            this.removeChild(oldValue);
        }

        if (newValue) {
            const indexBack = this.getChildIndex(this.backDrop);
            const index = this.getChildIndex(newValue);
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
    onTopLayoutChanged(event: EventData) {
        return this.onLayoutChange('top', event);
    }

    onBottomLayoutChanged(event: EventData) {
        return this.onLayoutChange('bottom', event);
    }
    addChild(child) {
        // for now we ignore this
        // to make sure we add the view in the property change
        // this is to make sure the view does not get "visible" too quickly
        // before we apply the translation
        // super.addChild(child);
    }
    public _onDrawerContentChanged(side: Side | VerticalSide, oldValue: View, newValue: View) {
        // console.log('_onDrawerContentChanged', side, oldValue, newValue);
        if (oldValue) {
            switch (side) {
                case 'right':
                    oldValue.off('layoutChanged', this.onRightLayoutChanged, this);
                    break;

                case 'left':
                    oldValue.off('layoutChanged', this.onLeftLayoutChanged, this);
                    break;

                case 'top':
                    oldValue.off('layoutChanged', this.onTopLayoutChanged, this);
                    break;

                case 'bottom':
                    oldValue.off('layoutChanged', this.onBottomLayoutChanged, this);
                    break;
            }

            this.removeChild(oldValue);
        }

        if (newValue) {
            // newValue.columns = "auto"
            if (side === 'left' || side === 'right') {
                newValue.horizontalAlignment = side;
            } else {
                newValue.verticalAlignment = side;
            }
            switch (side) {
                case 'right':
                    newValue.on('layoutChanged', this.onRightLayoutChanged, this);
                    break;

                case 'left':
                    newValue.on('layoutChanged', this.onLeftLayoutChanged, this);
                    break;

                case 'top':
                    newValue.on('layoutChanged', this.onTopLayoutChanged, this);
                    break;

                case 'bottom':
                    newValue.on('layoutChanged', this.onBottomLayoutChanged, this);
                    break;
            }
            const mode = this.modes[side];
            newValue.visibility = 'hidden';
            // this.addChild(newValue);
            this.onSideModeChanged(side, mode, undefined);
        }
    }
    onSideModeChanged(side: Side | VerticalSide, mode: Mode, oldMode: Mode) {
        if ((oldMode && oldMode === mode) || (oldMode && oldMode !== 'under' && mode !== 'under')) {
            return;
        }
        const drawer = this[side + 'Drawer'] as View;
        if (!drawer) {
            return;
        }
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
        if (side === 'left' || side === 'right') {
            const width = this.viewWidth[side];
            const delta = Math.max(width - value, 0);
            const progress = delta / width;
            if (this.translationFunction) {
                return this.translationFunction(side, width, value, delta, progress);
            }
            if (this.modes[side] === 'under') {
                return {
                    mainContent: {
                        translateX: side === 'right' ? -delta : delta,
                    },
                    [side + 'Drawer']: {
                        translateX: 0,
                    },
                    backDrop: {
                        translateX: side === 'right' ? -delta : delta,
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
        } else {
            const height = this.viewHeight[side];
            const delta = Math.max(height - value, 0);
            const progress = delta / height;
            if (this.translationFunction) {
                return this.translationFunction(side, height, value, delta, progress);
            }
            if (this.modes[side] === 'under') {
                return {
                    mainContent: {
                        translateY: side === 'bottom' ? -delta : delta,
                    },
                    [side + 'Drawer']: {
                        translateY: 0,
                    },
                    backDrop: {
                        translateY: side === 'bottom' ? -delta : delta,
                        opacity: progress,
                    },
                };
            } else {
                return {
                    mainContent: {
                        translateY: 0,
                    },
                    [side + 'Drawer']: {
                        translateY: side === 'top' ? -value : value,
                    },
                    backDrop: {
                        translateY: 0,
                        opacity: progress,
                    },
                };
            }
        }
    }
    onLayoutChange(side: Side | VerticalSide, event: EventData) {
        const contentView = event.object as GridLayout;
        // console.log('onLayoutChange', side, width);
        let data;
        if (side === 'left' || side === 'right') {
            const width = Math.round(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredWidth()));
            if (this.translationX[side] === 0) {
                this.viewWidth[side] = width;
                data = this.computeTranslationData(side, width);
                this.translationX[side] = width;
            } else {
                const shown = this.viewWidth[side] - this.translationX[side];
                this.viewWidth[side] = width;
                data = this.computeTranslationData(side, width - shown);
                this.translationX[side] = width - shown;
            }
        } else {
            const height = Math.round(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredHeight()));
            if (this.translationY[side] === 0) {
                this.viewHeight[side] = height;
                data = this.computeTranslationData(side, height);
                this.translationY[side] = height;
            } else {
                const shown = this.viewHeight[side] - this.translationY[side];
                this.viewHeight[side] = height;
                data = this.computeTranslationData(side, height - shown);
                this.translationY[side] = height - shown;
            }
        }
        if (data) {
            // delay applyTrData or it will create a layout issue on iOS
            setTimeout(() => this.applyTrData(data, side), 0);
        }
    }
    onTapGestureState(args: GestureStateEventData) {
        const { state } = args.data;
        // console.log('onTapGestureState', state, this.showingSide, this.needToSetSide);
        if (state === GestureState.BEGAN) {
            this.close();
        }
    }
    onGestureState(args: GestureStateEventData) {
        const { state, prevState, extraData, view } = args.data;
        const width = Math.round(Utils.layout.toDeviceIndependentPixels(this.getMeasuredWidth()));
        const height = Math.round(Utils.layout.toDeviceIndependentPixels(this.getMeasuredHeight()));

        // console.log('onGestureState', prevState, state, this.showingSide, this.needToSetSide, width, height);
        if (state === GestureState.BEGAN) {
            if (
                !this.showingSide &&
                !(
                    (this.leftDrawer && extraData.x <= this.leftSwipeDistance) ||
                    (this.rightDrawer && extraData.x >= width - this.rightSwipeDistance) ||
                    (this.bottomDrawer && extraData.y >= height - this.bottomSwipeDistance) ||
                    (this.topDrawer && extraData.y <= this.topSwipeDistance)
                )
            ) {
                args.object.cancel();
                return;
            }
            // this.nativeGestureHandler.cancel();
        } else if (state === GestureState.ACTIVE && !this.showingSide) {
            if (this.leftDrawer && extraData.x <= this.leftSwipeDistance) {
                this.needToSetSide = 'left';
                this.leftDrawer.visibility = 'visible';
            } else if (this.rightDrawer && extraData.x >= width - this.rightSwipeDistance) {
                this.needToSetSide = 'right';
                this.rightDrawer.visibility = 'visible';
            } else if (this.bottomDrawer && extraData.y >= height - this.bottomSwipeDistance) {
                this.needToSetSide = 'bottom';
                this.bottomDrawer.visibility = 'visible';
            } else if (this.topDrawer && extraData.y <= this.topSwipeDistance) {
                this.needToSetSide = 'top';
                this.topDrawer.visibility = 'visible';
            }
        }
        this.updateIsPanning(state);

        if (prevState === GestureState.ACTIVE) {
            this.needToSetSide = null;
            const side = this.showingSide;
            if (!side) {
                return;
            }
            const { velocityX, velocityY, translationX, translationY } = extraData;

            const dragToss = 0.05;

            let destSnapPoint = 0;
            if (side === 'left' || side === 'right') {
                const viewWidth = this.viewWidth[side];
                const viewX = this.translationX[side] - viewWidth;
                const x = translationX - this.prevDeltaX;
                this.prevDeltaX = 0;
                const totalDelta = x + dragToss * velocityX;

                if (side === 'left') {
                    if (totalDelta < -DEFAULT_TRIGGER_WIDTH) {
                        destSnapPoint = 0;
                    } else if (totalDelta > DEFAULT_TRIGGER_WIDTH) {
                        destSnapPoint = viewWidth;
                    } else {
                        const endOffsetX = viewX + totalDelta;
                        const progress = Math.abs(endOffsetX / viewWidth);
                        destSnapPoint = progress > 0.5 ? viewWidth : 0;
                    }
                } else if (side === 'right') {
                    if (-totalDelta < -DEFAULT_TRIGGER_WIDTH) {
                        destSnapPoint = 0;
                    } else if (-totalDelta > DEFAULT_TRIGGER_WIDTH) {
                        destSnapPoint = viewWidth;
                    } else {
                        const endOffsetX = viewX + totalDelta;
                        const progress = Math.abs(endOffsetX / viewWidth);
                        destSnapPoint = progress > 0.5 ? viewWidth : 0;
                    }
                }
            } else {
                const viewHeight = this.viewHeight[side];
                const viewY = this.translationY[side] - viewHeight;
                const y = translationY - this.prevDeltaY;
                this.prevDeltaY = 0;
                const totalDelta = y + dragToss * velocityY;

                if (side === 'top') {
                    if (totalDelta < -DEFAULT_TRIGGER_HEIGHT) {
                        destSnapPoint = 0;
                    } else if (totalDelta > DEFAULT_TRIGGER_HEIGHT) {
                        destSnapPoint = viewHeight;
                    } else {
                        const endOffsetY = viewY + totalDelta;
                        const progress = Math.abs(endOffsetY / viewHeight);
                        destSnapPoint = progress > 0.5 ? viewHeight : 0;
                    }
                } else if (side === 'bottom') {
                    if (-totalDelta < -DEFAULT_TRIGGER_HEIGHT) {
                        destSnapPoint = 0;
                    } else if (-totalDelta > DEFAULT_TRIGGER_HEIGHT) {
                        destSnapPoint = viewHeight;
                    } else {
                        const endOffsetY = viewY + totalDelta;
                        const progress = Math.abs(endOffsetY / viewHeight);
                        destSnapPoint = progress > 0.5 ? viewHeight : 0;
                    }
                }
            }

            this.animateToPosition(side, destSnapPoint);
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
        if (side === 'left' || side === 'right') {
            const deltaX = data.extraData.translationX;
            if (this.isAnimating || !this.isPanning || deltaX === 0) {
                this.prevDeltaX = deltaX;
                return;
            }
            if (this.needToSetSide) {
                this.showingSide = this.needToSetSide;
                this.needToSetSide = null;
            }
            const width = this.viewWidth[side];

            const viewX = this.translationX[side] - width;

            let x = deltaX - this.prevDeltaX;
            if (this.showingSide === 'left') {
                x = -x;
            }
            const trX = this.constrainX(this.showingSide, viewX + x);

            this.translationX[side] = width + trX;
            const trData = this.computeTranslationData(side, width + trX);
            this.backDrop.visibility = trData.backDrop && trData.backDrop.opacity > 0 ? 'visible' : 'hidden';
            this.applyTrData(trData, side);
            this.updateIsPanning(data.state);
            this.prevDeltaX = deltaX;
        } else {
            const deltaY = data.extraData.translationY;
            if (this.isAnimating || !this.isPanning || deltaY === 0) {
                this.prevDeltaY = deltaY;
                return;
            }
            if (this.needToSetSide) {
                this.showingSide = this.needToSetSide;
                this.needToSetSide = null;
            }
            const height = this.viewHeight[side];

            const viewY = this.translationY[side] - height;

            let y = deltaY - this.prevDeltaY;
            if (this.showingSide === 'top') {
                y = -y;
            }
            const trY = this.constrainY(this.showingSide, viewY + y);

            this.translationY[side] = height + trY;
            const trData = this.computeTranslationData(side, height + trY);
            this.backDrop.visibility = trData.backDrop && trData.backDrop.opacity > 0 ? 'visible' : 'hidden';
            this.applyTrData(trData, side);
            this.updateIsPanning(data.state);
            this.prevDeltaY = deltaY;
        }
    }

    applyTrData(trData: { [k: string]: any }, side: Side | VerticalSide) {
        // console.log('applyTrData', trData, side);
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
    constrainY(side, y) {
        const height = this.viewHeight[side];
        if (y > 0) {
            return 0;
        } else if (y < -height) {
            return -height;
        }
        return y;
    }

    async animateToPosition(side: Side | VerticalSide, position, duration = OPEN_DURATION) {
        if (this.showingSide && side !== this.showingSide) {
            this.animateToPosition(this.showingSide, 0, duration);
        }
        let trData;
        if (side === 'left' || side === 'right') {
            const width = this.viewWidth[side];
            trData = this.computeTranslationData(side, width - position);
            this.translationX[side] = width - position;
        } else {
            const height = this.viewHeight[side];
            trData = this.computeTranslationData(side, height - position);
            this.translationY[side] = height - position;
        }
        if (position !== 0) {
            this.showingSide = side;
            const drawer = this[side + 'Drawer'] as View;
            if (drawer) {
                drawer.visibility = 'visible';
            }
            if (trData.backDrop && trData.backDrop.opacity > 0 && this.backDrop.visibility !== 'visible') {
                this.backDrop.opacity = 0;
                this.backDrop.visibility = 'visible';
            }
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
        try {
            await new Animation(params).play();
        } catch (err) {
            console.error('animateToPosition', err);
        } finally {
            // apply tr data to prevent hickups on iOS
            // and handle animation cancelled errors
            this.applyTrData(trData, side);
            if (position !== 0) {
            } else {
                if (trData.backDrop) {
                    this.backDrop.visibility = 'hidden';
                }
            }
        }
    }
    isSideOpened() {
        return !!this.showingSide;
    }

    isOpened(side?: Side | VerticalSide) {
        if (side) {
            return this.showingSide === side;
        }
        return !!this.showingSide;
    }
    async toggle(side?: Side | VerticalSide) {
        if (!side) {
            if (this.leftDrawer) {
                side = 'left';
            } else if (this.rightDrawer) {
                side = 'right';
            } else if (this.bottomDrawer) {
                side = 'bottom';
            } else if (this.topDrawer) {
                side = 'top';
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
    async open(side?: Side | VerticalSide) {
        if (!side) {
            if (this.leftDrawer) {
                side = 'left';
            } else if (this.rightDrawer) {
                side = 'right';
            } else if (this.bottomDrawer) {
                side = 'bottom';
            } else if (this.topDrawer) {
                side = 'top';
            } else {
                return;
            }
        }
        if (side === 'left' || side === 'right') {
            this.animateToPosition(side, this.viewWidth[side]);
        } else {
            this.animateToPosition(side, this.viewHeight[side]);
        }
    }
    async close(side?: Side | VerticalSide) {
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
    // get mainViewTranslationX() {
    //     if (!this.showingSide || this.modes[this.showingSide] !== 'slide') {
    //         return 0;
    //     }
    //     return this.viewWidth[this.showingSide] - this.translationX[this.showingSide];
    // }
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
topDrawerContentProperty.register(Drawer);
bottomDrawerContentProperty.register(Drawer);
gestureEnabledProperty.register(Drawer);
leftDrawerModeProperty.register(Drawer);
rightDrawerModeProperty.register(Drawer);
bottomDrawerModeProperty.register(Drawer);
topDrawerModeProperty.register(Drawer);
translationFunctionProperty.register(Drawer);

export function install() {
    installGestures();
}
