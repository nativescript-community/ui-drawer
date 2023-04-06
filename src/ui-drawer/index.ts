import {
    GestureHandlerStateEvent,
    GestureHandlerTouchEvent,
    GestureState,
    GestureStateEventData,
    GestureTouchEventData,
    HandlerType,
    Manager,
    PanGestureHandler,
    install as installGestures
} from '@nativescript-community/gesturehandler';
import { Animation, AnimationDefinition, Application, CSSType, Color, CoreTypes, EventData, GridLayout, Property, Utils, View, booleanConverter } from '@nativescript/core';
installGestures(false);
const OPEN_DURATION = 200;
const CLOSE_DURATION = 200;
export const PAN_GESTURE_TAG = 12431;
const DEFAULT_TRIGGER_WIDTH = 20;
const DEFAULT_TRIGGER_HEIGHT = 20;

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
    }
});
export const rightDrawerContentProperty = new Property<Drawer, View>({
    name: 'rightDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => {
        target._onDrawerContentChanged('right', oldValue, newValue);
    }
});
export const topDrawerContentProperty = new Property<Drawer, View>({
    name: 'topDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => {
        target._onDrawerContentChanged('top', oldValue, newValue);
    }
});
export const bottomDrawerContentProperty = new Property<Drawer, View>({
    name: 'bottomDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => {
        target._onDrawerContentChanged('bottom', oldValue, newValue);
    }
});
export const gestureEnabledProperty = new Property<Drawer, boolean>({
    name: 'gestureEnabled',
    defaultValue: true,
    valueConverter: booleanConverter
});
export const backdropColorProperty = new Property<Drawer, Color>({
    name: 'backdropColor',
    valueConverter: (c) => (c ? new Color(c) : null)
});
export const leftDrawerModeProperty = new Property<Drawer, Mode>({
    name: 'leftDrawerMode'
});
export const rightDrawerModeProperty = new Property<Drawer, Mode>({
    name: 'rightDrawerMode'
});
export const topDrawerModeProperty = new Property<Drawer, Mode>({
    name: 'topDrawerMode'
});
export const bottomDrawerModeProperty = new Property<Drawer, Mode>({
    name: 'bottomDrawerMode'
});
export const translationFunctionProperty = new Property<Drawer, Function>({
    name: 'translationFunction'
});
export const backDropEnabledProperty = new Property<Drawer, boolean>({
    defaultValue: true,
    valueConverter: booleanConverter,
    name: 'backDropEnabled'
});

export const startingSideProperty = new Property<Drawer, Side | VerticalSide>({
    name: 'startingSide'
});

@CSSType('Drawer')
export class Drawer extends GridLayout {
    public leftDrawer?: View;
    public rightDrawer?: View;
    public bottomDrawer?: View;
    public topDrawer?: View;
    public mainContent: View;
    public backDrop: View;

    public gestureMinDist = 10;
    public gestureHandlerOptions;
    public waitFor = [];
    public simultaneousHandlers = [];
    public shouldStartSheetDragging?: (side: Side | VerticalSide) => boolean;
    public shouldPan?: (side: Side | VerticalSide) => boolean;
    public leftSwipeDistance = 40;
    public rightSwipeDistance = 40;
    public bottomSwipeDistance = 40;
    public topSwipeDistance = 40;
    public backdropColor = new Color('rgba(0, 0, 0, 0.7)');
    public leftOpenedDrawerAllowDraging = true;
    public rightOpenedDrawerAllowDraging = true;
    public bottomOpenedDrawerAllowDraging = true;
    public topOpenedDrawerAllowDraging = true;
    public leftClosedDrawerAllowDraging = true;
    public rightClosedDrawerAllowDraging = true;
    public bottomClosedDrawerAllowDraging = true;
    public topClosedDrawerAllowDraging = true;
    public panGestureHandler: PanGestureHandler;
    public gestureEnabled = true;
    public backdropTapGestureEnabled = true;
    private isPanning = false;
    private isAnimating = false;
    private prevDeltaX = 0;
    private prevDeltaY = 0;
    private viewWidth: { [k in Side]: number } = { left: undefined, right: undefined };
    private viewHeight: { [k in VerticalSide]: number } = { bottom: undefined, top: undefined };
    private translationX: { [k in Side]: number } = { left: 0, right: 0 };
    private translationY: { [k in VerticalSide]: number } = { bottom: 0, top: 0 };
    private showingSide: Side | VerticalSide = null;
    private startingSide: Side | VerticalSide = null;
    private needToSetSide: Side | VerticalSide;

    private modes: Partial<{ [k in Side | VerticalSide]: Mode }> = { left: 'slide', right: 'slide', bottom: 'slide', top: 'slide' };
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
    backDropEnabled: boolean = true;

    constructor() {
        super();
        this.isPassThroughParentEnabled = true;
    }
    _onBackDropEnabledValueChanged() {
        if (this.backDropEnabled && !this.backDrop) {
            this.backDrop = new GridLayout();
            this.backDrop.backgroundColor = this.backdropColor;
            this.backDrop.opacity = 0;
            this.backDrop.visibility = 'hidden';

            this.insertChild(this.backDrop, 0);
        } else if (!this.backDropEnabled && this.backDrop) {
            this.removeChild(this.backDrop);
            this.backDrop = null;
        }
    }
    [backDropEnabledProperty.setNative](value) {
        this._onBackDropEnabledValueChanged();
    }
    [startingSideProperty.setNative](value: Side | VerticalSide) {
        console.log('startingSideProperty', value, this.isLayoutValid);
        if (!this.isLayoutValid) {
            this.showingSide = value;
            const drawer = this[value + 'Drawer'] as View;
            if (drawer) {
                drawer.visibility = this.showingSide === value ? 'visible' : 'hidden';
            }
        } else {
            this.open(value, 0);
        }
    }
    onBackdropTap() {
        this.close();
    }
    initGestures() {
        const manager = Manager.getInstance();
        const gestureHandler = manager.createGestureHandler(HandlerType.PAN, PAN_GESTURE_TAG, {
            shouldStartGesture: this.shouldStartGesture.bind(this),
            simultaneousHandlers: this.simultaneousHandlers,
            waitFor: this.waitFor,
            minDist: this.gestureMinDist,
            ...(this.gestureHandlerOptions || {})
        });
        gestureHandler.on(GestureHandlerTouchEvent, this.onGestureTouch, this);
        gestureHandler.on(GestureHandlerStateEvent, this.onGestureState, this);
        gestureHandler.attachToView(this);
        this.panGestureHandler = gestureHandler as any;
    }
    initNativeView() {
        if (this.backDropEnabled && !this.backDrop) {
            this[backDropEnabledProperty.setNative](this.backDropEnabled);
        }
        super.initNativeView();
        if (this.backDrop && this.backdropTapGestureEnabled) {
            this.backDrop.on('tap', this.onBackdropTap, this);
        }
        if (this.gestureEnabled) {
            this.initGestures();
        }
    }
    disposeNativeView() {
        super.disposeNativeView();
        if (this.backDrop) {
            this.backDrop.off('tap', this.onBackdropTap, this);
        }
        if (this.panGestureHandler) {
            this.panGestureHandler.off(GestureHandlerTouchEvent, this.onGestureTouch, this);
            this.panGestureHandler.off(GestureHandlerStateEvent, this.onGestureState, this);
            this.panGestureHandler.detachFromView();
            this.panGestureHandler = null;
        }
    }

    shouldStartSheetDraggingInternal(side: Side | VerticalSide) {
        let result = this[side + 'OpenedDrawerAllowDraging'];
        if (result && this.shouldStartSheetDragging) {
            result = this.shouldStartSheetDragging(side);
        }
        return result;
    }

    shouldStartGesture(data) {
        const width = Math.round(Utils.layout.toDeviceIndependentPixels(this.getMeasuredWidth()));
        const height = Math.round(Utils.layout.toDeviceIndependentPixels(this.getMeasuredHeight()));
        const side = this.showingSide;
        if (side) {
            if (side === 'left' || side === 'right') {
                const viewWidth = this.viewWidth[side];
                if ((side === 'left' && data.x <= viewWidth) || (side === 'right' && data.x >= width - viewWidth)) {
                    return this.shouldStartSheetDraggingInternal(side);
                }
            } else {
                const viewHeight = this.viewHeight[side];
                if ((side === 'top' && data.y <= viewHeight) || (side === 'bottom' && data.y >= height - viewHeight)) {
                    return this.shouldStartSheetDraggingInternal(side);
                }
            }
            // for now without backDrop we force allow gesture
            return !this.backDrop || this.backDrop.opacity !== 0;
        } else {
            let needToSetSide;
            if (this.leftDrawer && data.x <= this.leftSwipeDistance) {
                needToSetSide = 'left';
            } else if (this.rightDrawer && data.x >= width - this.rightSwipeDistance) {
                needToSetSide = 'right';
            } else if (this.bottomDrawer && data.y >= height - this.bottomSwipeDistance) {
                needToSetSide = 'bottom';
            } else if (this.topDrawer && data.y <= this.topSwipeDistance) {
                needToSetSide = 'top';
            }
            if (needToSetSide && this[needToSetSide + 'ClosedDrawerAllowDraging']) {
                this.needToSetSide = needToSetSide;
                return true;
            }
        }
        return false;
    }
    onGestureState(args: GestureStateEventData) {
        const { state, prevState, extraData, view } = args.data;
        if (state === GestureState.ACTIVE && !this.showingSide) {
            if (this.needToSetSide === 'left') {
                this.leftDrawer.visibility = 'visible';
            } else if (this.needToSetSide === 'right') {
                this.rightDrawer.visibility = 'visible';
            } else if (this.needToSetSide === 'bottom') {
                this.bottomDrawer.visibility = 'visible';
            } else if (this.needToSetSide === 'top') {
                this.topDrawer.visibility = 'visible';
            }
        }
        this.updateIsPanning(state);

        if (prevState === GestureState.ACTIVE) {
            this.needToSetSide = null;
            const side = this.showingSide;
            if (!side || (this.shouldPan && !this.shouldPan(side))) {
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
    onGestureTouch(args: GestureTouchEventData) {
        const data = args.data;
        const side = this.showingSide || this.needToSetSide;
        if (data.state !== GestureState.ACTIVE || !side || this.isAnimating) {
            return;
        }
        if (side === 'left' || side === 'right') {
            const deltaX = data.extraData.translationX;
            if (this.isAnimating || !this.isPanning || deltaX === 0 || (this.shouldPan && !this.shouldPan(side))) {
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
            if (this.backDrop) {
                this.backDrop.visibility = trData.backDrop && trData.backDrop.opacity > 0 ? 'visible' : 'hidden';
            }
            this.applyTrData(trData, side);
            this.updateIsPanning(data.state);
            this.prevDeltaX = deltaX;
        } else {
            const deltaY = data.extraData.translationY;
            if (this.isAnimating || !this.isPanning || deltaY === 0 || (this.shouldPan && !this.shouldPan(side))) {
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
            if (this.backDrop) {
                this.backDrop.visibility = trData.backDrop && trData.backDrop.opacity > 0 ? 'visible' : 'hidden';
            }
            this.applyTrData(trData, side);
            this.updateIsPanning(data.state);
            this.prevDeltaY = deltaY;
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
        if (this.backDrop) {
            this.backDrop.backgroundColor = value;
        }
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
        this._onBackDropEnabledValueChanged();
        if (oldValue) {
            this.removeChild(oldValue);
        }

        if (newValue) {
            const indexBack = this.backDrop ? this.getChildIndex(this.backDrop) : 0;
            const index = this.getChildIndex(newValue);
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
        this._onBackDropEnabledValueChanged();
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
            this.onSideModeChanged(side, this.modes[side], undefined);
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
        const indexBack = this.backDrop ? this.getChildIndex(this.backDrop) : 0;
        const index = this.getChildIndex(drawer);
        drawer.visibility = this.showingSide === side ? 'visible' : 'hidden';

        if (mode === 'under') {
            if (index > indexBack - 1 && drawer.parent === this) {
                this.removeChild(drawer);
                this.insertChild(drawer, Math.max(indexBack - 1, 0));
            } else {
                // initial addition
                // this.backDrop.visibility = trData.backDrop && trData.backDrop.opacity > 0 ? 'visible' : 'hidden';
                this.insertChild(drawer, 0);
            }
        } else {
            if (index <= indexBack && drawer.parent === this) {
                this.removeChild(drawer);
                this.insertChild(drawer, indexBack + 1);
            } else {
                // initial addition
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
                        translateX: side === 'right' ? -delta : delta
                    },
                    [side + 'Drawer']: {
                        translateX: 0
                    },
                    backDrop: {
                        translateX: side === 'right' ? -delta : delta,
                        opacity: progress
                    }
                };
            } else {
                return {
                    mainContent: {
                        // translateX: 0
                    },
                    [side + 'Drawer']: {
                        translateX: side === 'left' ? -value : value
                    },
                    backDrop: {
                        // translateX: 0,
                        opacity: progress
                    }
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
                        translateY: side === 'bottom' ? -delta : delta
                    },
                    [side + 'Drawer']: {
                        translateY: 0
                    },
                    backDrop: {
                        translateY: side === 'bottom' ? -delta : delta,
                        opacity: progress
                    }
                };
            } else {
                return {
                    mainContent: {
                        translateY: 0
                    },
                    [side + 'Drawer']: {
                        translateY: side === 'top' ? -value : value
                    },
                    backDrop: {
                        translateY: 0,
                        opacity: progress
                    }
                };
            }
        }
    }
    onLayoutChange(side: Side | VerticalSide, event: EventData) {
        const contentView = event.object as GridLayout;
        let data;
        let safeAreaOffset = 0;
        let changed = false;
        if (side === 'left' || side === 'right') {
            if (__IOS__) {
                const deviceOrientation = UIDevice.currentDevice.orientation;
                if (deviceOrientation === UIDeviceOrientation.LandscapeLeft) {
                    safeAreaOffset = Application.ios.window.safeAreaInsets.left;
                } else if (deviceOrientation === UIDeviceOrientation.LandscapeRight) {
                    safeAreaOffset = Application.ios.window.safeAreaInsets.right;
                }
            }
            const width = Math.ceil(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredWidth()) + safeAreaOffset);
            const firstSet = this.viewWidth[side] === undefined;
            changed = width !== this.viewWidth[side];
            this.viewWidth[side] = width;
            if (firstSet) {
                const offset = this.showingSide === side ? 0 : width;
                data = this.computeTranslationData(side, offset);
                const shown = this.viewWidth[side] - offset;
                this.translationX[side] = width - shown;
            } else if (this.translationX[side] === 0) {
                //opened: we dont need to do anything as no translation
            } else {
                const shown = this.viewWidth[side] - this.translationX[side];
                data = this.computeTranslationData(side, width - shown);
                this.translationX[side] = width - shown;
            }
        } else {
            safeAreaOffset = __IOS__ && Application.ios.window.safeAreaInsets ? Application.ios.window.safeAreaInsets.bottom : 0;
            const height = Math.ceil(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredHeight()) + safeAreaOffset);
            const firstSet = this.viewHeight[side] === undefined;
            changed = height !== this.viewHeight[side];
            this.viewHeight[side] = height;
            if (firstSet) {
                const offset = this.showingSide === side ? 0 : height;
                data = this.computeTranslationData(side, offset);
                const shown = this.viewHeight[side] - offset;
                this.translationY[side] = height - shown;
            } else if (this.translationX[side] === 0) {
                //opened: we dont need to do anything as no translation
            } else {
                const shown = this.viewHeight[side] - this.translationY[side];
                data = this.computeTranslationData(side, height - shown);
                this.translationY[side] = height - shown;
            }
        }
        if (changed && data) {
            // delay applyTrData or it will create a layout issue on iOS
            setTimeout(() => {
                this.applyTrData(data, side);
                if (this.backDrop) {
                    this.backDrop.visibility = data.backDrop && data.backDrop.opacity > 0 ? 'visible' : 'hidden';
                }
            }, 0);
        }
    }
    forceEnsureSize(side: Side | VerticalSide) {
        const contentView = this[side + 'Drawer'] as View;
        let data;
        let safeAreaOffset = 0;
        if (side === 'left' || side === 'right') {
            if (__IOS__) {
                const deviceOrientation = UIDevice.currentDevice.orientation;
                if (deviceOrientation === 3) {
                    safeAreaOffset = Application.ios.window.safeAreaInsets.left;
                } else if (deviceOrientation === 4) {
                    safeAreaOffset = Application.ios.window.safeAreaInsets.right;
                }
            }
            const width = Math.ceil(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredWidth()) + safeAreaOffset);
            this.viewWidth[side] = width;
        } else {
            safeAreaOffset = __IOS__ && Application.ios.window.safeAreaInsets ? Application.ios.window.safeAreaInsets.bottom : 0;
            const height = Math.ceil(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredHeight()) + safeAreaOffset);
            this.viewHeight[side] = height;
        }
    }
    onTapGestureState(args: GestureStateEventData) {
        const { state } = args.data;
        if (state === GestureState.BEGAN) {
            this.close();
        }
    }
    updateIsPanning(state: GestureState) {
        this.isPanning = state === GestureState.ACTIVE || state === GestureState.BEGAN;
    }

    applyTrData(trData: { [k: string]: any }, side: Side | VerticalSide) {
        console.log('applyTrData', trData);
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
        console.log('animateToPosition', side, position, duration, this.showingSide);
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
                console.log('showing drawer');
                drawer.visibility = 'visible';
            }
            if (this.backDrop && trData.backDrop && trData.backDrop.opacity > 0 && this.backDrop.visibility !== 'visible') {
                this.backDrop.opacity = 0;
                this.backDrop.visibility = 'visible';
            }
            this.notify({ eventName: 'open', side, duration } as DrawerEventData);
        } else {
            this.showingSide = null;
            this.notify({ eventName: 'close', side, duration } as DrawerEventData);
        }

        // TODO: custom animation curve + apply curve on gesture
        const params = Object.keys(trData)
            .map(
                (k) =>
                    this[k] &&
                    Object.assign(
                        {
                            target: this[k],
                            curve: CoreTypes.AnimationCurve.easeInOut,
                            duration
                        },
                        duration ? transformAnimationValues(trData[k]) : trData[k]
                    )
            )
            .filter((a) => !!a);
        try {
            if (duration) {
                await new Animation(params).play();
            }
        } catch (err) {
            console.error('animateToPosition', err);
        } finally {
            // apply tr data to prevent hickups on iOS
            // and handle animation cancelled errors
            if ((position !== 0 && this.showingSide === side) || (position === 0 && !this.showingSide)) {
                this.applyTrData(trData, side);
                if (position !== 0) {
                    // if (trData.backDrop) {
                    //     this.backDrop.opacity = 1;
                    // }
                } else {
                    const drawer = this[side + 'Drawer'] as View;
                    if (drawer) {
                        drawer.visibility = 'hidden';
                    }
                    if (this.backDrop && trData.backDrop) {
                        this.backDrop.visibility = 'hidden';
                    }
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
    async open(side?: Side | VerticalSide, duration = OPEN_DURATION) {
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
        if (this.showingSide && this.showingSide !== side) {
            this.close();
        }

        if (!this.isOpened(side)) {
            this.forceEnsureSize(side);
        }
        if (side === 'left' || side === 'right') {
            this.animateToPosition(side, this.viewWidth[side], duration);
        } else {
            this.animateToPosition(side, this.viewHeight[side], duration);
        }
    }
    async close(side?: Side | VerticalSide, duration = CLOSE_DURATION) {
        if (!side) {
            if (this.showingSide) {
                side = this.showingSide;
            } else {
                return;
            }
        }
        this.showingSide = null;
        return this.animateToPosition(side, 0, duration);
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
    }
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
backDropEnabledProperty.register(Drawer);
startingSideProperty.register(Drawer);

export function install() {
    installGestures();
}
