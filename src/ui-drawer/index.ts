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
    valueChanged: (target, oldValue, newValue) => target._onDrawerContentChanged('left', oldValue, newValue)
});
export const rightDrawerContentProperty = new Property<Drawer, View>({
    name: 'rightDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => target._onDrawerContentChanged('right', oldValue, newValue)
});
export const topDrawerContentProperty = new Property<Drawer, View>({
    name: 'topDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => target._onDrawerContentChanged('top', oldValue, newValue)
});
export const bottomDrawerContentProperty = new Property<Drawer, View>({
    name: 'bottomDrawer',
    defaultValue: undefined,
    valueChanged: (target, oldValue, newValue) => target._onDrawerContentChanged('bottom', oldValue, newValue)
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
export const translationFunctionProperty = new Property<Drawer, TranslationFunctionType>({
    name: 'translationFunction'
});
export const animationFunctionProperty = new Property<Drawer, AnimationFunctionType>({
    name: 'animationFunction'
});
export const backDropEnabledProperty = new Property<Drawer, boolean>({
    defaultValue: true,
    valueConverter: booleanConverter,
    name: 'backDropEnabled'
});

export const startingSideProperty = new Property<Drawer, Side | VerticalSide | 'none'>({
    name: 'startingSide',
    defaultValue: null
});
export const gestureHandlerOptionsProperty = new Property({
    name: 'gestureHandlerOptions'
});

const SIDES = ['left', 'right', 'top', 'bottom'];

export interface TrData {
    [k: string]: AnimationDefinition;
    leftDrawer?: AnimationDefinition;
    rightDrawer?: AnimationDefinition;
    bottomDrawer?: AnimationDefinition;
    topDrawer?: AnimationDefinition;
    backDrop?: AnimationDefinition;
    mainContent?: AnimationDefinition;
}
export type TranslationFunctionType = (side: Side | VerticalSide, width: number, value: number, delta: number, progress: number, drawer: Drawer) => TrData;
export type AnimationFunctionType = (side: Side | VerticalSide, duration: number, trData: TrData, animationParams: AnimationDefinition[], drawer: Drawer) => Promise<void>;

@CSSType('Drawer')
export class Drawer extends GridLayout {
    public leftDrawer?: View;
    public rightDrawer?: View;
    public bottomDrawer?: View;
    public topDrawer?: View;
    public mainContent: View;
    public backDrop: View;

    public leftDrawerMode;
    public rightDrawerMode;
    public bottomDrawerMode;
    public topDrawerMode;
    public gestureTag = PAN_GESTURE_TAG;
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
    public startingSide: Side | VerticalSide;
    public openAnimationDuration = OPEN_DURATION;
    public closeAnimationDuration = CLOSE_DURATION;

    private mIsPanning = false;
    private mIsAnimating = false;
    private mPrevDeltaX = 0;
    private mPrevDeltaY = 0;
    private mViewWidth: { [k in Side]: number } = { left: undefined, right: undefined };
    private mViewHeight: { [k in VerticalSide]: number } = { bottom: undefined, top: undefined };
    private mTranslationX: { [k in Side]: number } = { left: 0, right: 0 };
    private mTranslationY: { [k in VerticalSide]: number } = { bottom: 0, top: 0 };
    private mShowingSide: Side | VerticalSide = null;
    // private mNeedToSetSide: Side | VerticalSide;
    private mModes: Partial<{ [k in Side | VerticalSide]: Mode }> = {  };

    translationFunction?: TranslationFunctionType;

    animationFunction?: AnimationFunctionType;
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

    getActualSide(side: Side | VerticalSide) {
        return SIDES.indexOf(side) >= 0 ? side : null;
    }

    updateStartingSide(side) {
        startingSideProperty.nativeValueChange(this, side);
    }
    [startingSideProperty.setNative](value: Side | VerticalSide) {
        value = this.getActualSide(value);
        if (value === this.mShowingSide) {
            return;
        }
        if (value && !this.mViewWidth[value] && !this.mViewHeight[value]) {
            this.mShowingSide = value;
            const drawer = this[value + 'Drawer'];
            if (drawer) {
                drawer.visibility = this.mShowingSide === value ? 'visible' : 'hidden';
            }
        } else if (value) {
            this.open(value, 0);
        } else {
            this.close(value, 0);
        }
    }
    onBackdropTap() {
        this.close();
    }
    initGestures() {
        const manager = Manager.getInstance();
        const gestureHandler = manager.createGestureHandler(HandlerType.PAN, this.gestureTag, {
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
        // const landscape = Application.orientation() === 'landscape';
        const width = Utils.layout.toDeviceIndependentPixels(this.getMeasuredWidth());
        const height = Utils.layout.toDeviceIndependentPixels(this.getMeasuredHeight());
        const side = this.mShowingSide;
        if (side) {
            if (side === 'left' || side === 'right') {
                const viewWidth = this.mViewWidth[side];
                if ((side === 'left' && data.x <= viewWidth) || (side === 'right' && data.x >= width - viewWidth)) {
                    return this.shouldStartSheetDraggingInternal(side);
                }
            } else {
                const viewHeight = this.mViewHeight[side];
                if ((side === 'top' && data.y <= viewHeight) || (side === 'bottom' && data.y >= height - viewHeight)) {
                    return this.shouldStartSheetDraggingInternal(side);
                }
            }
            // for now without backDrop we force allow gesture
            return !this.backDrop || this.backDrop.opacity !== 0;
        } else {
            let needToSetSide;
            if (this.leftDrawer && (!this.leftSwipeDistance || data.x <= this.leftSwipeDistance)) {
                needToSetSide = 'left';
            } else if (this.rightDrawer && (!this.rightSwipeDistance || data.x >= width - this.rightSwipeDistance)) {
                needToSetSide = 'right';
            } else if (this.bottomDrawer && (!this.bottomSwipeDistance || data.y >= height - this.bottomSwipeDistance)) {
                needToSetSide = 'bottom';
            } else if (this.topDrawer && (!this.topSwipeDistance || data.y <= this.topSwipeDistance)) {
                needToSetSide = 'top';
            }
            if (needToSetSide && this[needToSetSide + 'ClosedDrawerAllowDraging']) {
                // this.mNeedToSetSide = needToSetSide;
                return true;
            }
        }
        return false;
    }
    getDrawerToOpen(extraData) {
        if (extraData.translationX < 0 && this.rightDrawer) {
            return 'right';
        } else if (extraData.translationX > 0 && this.leftDrawer) {
            return 'left';
        } else if (extraData.translationY < 0 && this.bottomDrawer) {
            return 'bottom';
        } else if (extraData.translationY > 0 && this.topDrawer) {
            return 'top';
        }
        return null;
    }
    onGestureState(args: GestureStateEventData) {
        const { state, prevState, extraData, view } = args.data;
        if (state === GestureState.ACTIVE) {
            if (!this.mShowingSide) {
                const shouldShowSide = this.getDrawerToOpen(extraData);
                if (shouldShowSide && shouldShowSide !== this.mShowingSide) {
                    this[shouldShowSide + 'Drawer'].visibility = 'visible';
                    this.mShowingSide = shouldShowSide;
                    this.notify({ eventName: 'start', side: this.mShowingSide });
                }
                // if (this.mNeedToSetSide === 'left') {
                //     this.leftDrawer.visibility = 'visible';
                // } else if (this.mNeedToSetSide === 'right') {
                //     this.rightDrawer.visibility = 'visible';
                // } else if (this.mNeedToSetSide === 'bottom') {
                //     this.bottomDrawer.visibility = 'visible';
                // } else if (this.mNeedToSetSide === 'top') {
                //     this.topDrawer.visibility = 'visible';
                // }
            }
        }
        this.updateIsPanning(state);

        if (prevState === GestureState.ACTIVE) {
            const side = this.mShowingSide;
            // const side = this.mShowingSide || this.mNeedToSetSide;
            // this.mNeedToSetSide = null;
            if (!side || (this.shouldPan && !this.shouldPan(side))) {
                return;
            }
            const { velocityX, velocityY, translationX, translationY } = extraData;

            const dragToss = 0.05;

            let destSnapPoint = 0;
            if (side === 'left' || side === 'right') {
                const viewWidth = this.mViewWidth[side];
                const viewX = this.mTranslationX[side] - viewWidth;
                const x = translationX - this.mPrevDeltaX;
                this.mPrevDeltaX = 0;
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
                const viewHeight = this.mViewHeight[side];
                const viewY = this.mTranslationY[side] - viewHeight;
                const y = translationY - this.mPrevDeltaY;
                this.mPrevDeltaY = 0;
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
    isSideVisible(side: Side | VerticalSide) {
        if (side === 'left' || side === 'right') {
            return this.mViewWidth[side] - this.mTranslationX[side];
        } else {
            return this.mViewHeight[side] - this.mTranslationY[side];
        }
    }
    onGestureTouch(args: GestureTouchEventData) {
        const data = args.data;
        const { state, extraData, view } = args.data;
        // const side = this.mShowingSide || this.mNeedToSetSide;
        if (data.state !== GestureState.ACTIVE || this.mIsAnimating) {
            return;
        }
        const shouldShowSide = this.getDrawerToOpen(extraData);
        if (shouldShowSide && (!this.mShowingSide || (shouldShowSide !== this.mShowingSide && !this.isSideVisible(this.mShowingSide)))) {
            if (this.mShowingSide) {
                this[this.mShowingSide + 'Drawer'].visibility = 'hidden';
                this.notify({ eventName: 'end', side: this.mShowingSide });
            }
            this[shouldShowSide + 'Drawer'].visibility = 'visible';
            this.mShowingSide = shouldShowSide;
            this.notify({ eventName: 'start', side: this.mShowingSide });
        }
        const side = this.mShowingSide;
        if (!side || this.mIsAnimating) {
            return;
        }
        if (side === 'left' || side === 'right') {
            const deltaX = extraData.translationX;
            if (this.mIsAnimating || !this.mIsPanning || deltaX === 0 || (this.shouldPan && !this.shouldPan(side))) {
                this.mPrevDeltaX = deltaX;
                return;
            }
            // if (this.mNeedToSetSide) {
            //     this.mShowingSide = this.mNeedToSetSide;
            //     this.mNeedToSetSide = null;
            // }
            const width = this.mViewWidth[side];

            const viewX = this.mTranslationX[side] - width;

            let x = deltaX - this.mPrevDeltaX;
            if (side === 'left') {
                x = -x;
            }
            const trX = this.constrainX(side, viewX + x);

            this.mTranslationX[side] = width + trX;
            const trData = this.computeTranslationData(side, width + trX);
            if (this.backDrop) {
                this.backDrop.visibility = trData.backDrop && trData.backDrop.opacity > 0 ? 'visible' : 'hidden';
            }
            this.applyTrData(trData, side);
            this.updateIsPanning(state);
            this.mPrevDeltaX = deltaX;
        } else {
            const deltaY = extraData.translationY;
            if (this.mIsAnimating || !this.mIsPanning || deltaY === 0 || (this.shouldPan && !this.shouldPan(side))) {
                this.mPrevDeltaY = deltaY;
                return;
            }
            // if (this.mNeedToSetSide) {
            //     this.mShowingSide = this.mNeedToSetSide;
            //     this.mNeedToSetSide = null;
            // }
            const height = this.mViewHeight[side];

            const viewY = this.mTranslationY[side] - height;

            let y = deltaY - this.mPrevDeltaY;
            if (side === 'top') {
                y = -y;
            }
            const trY = this.constrainY(side, viewY + y);

            this.mTranslationY[side] = height + trY;
            const trData = this.computeTranslationData(side, height + trY);
            if (this.backDrop) {
                this.backDrop.visibility = trData.backDrop && trData.backDrop.opacity > 0 ? 'visible' : 'hidden';
            }
            this.applyTrData(trData, side);
            this.updateIsPanning(state);
            this.mPrevDeltaY = deltaY;
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
        this.onSideModeChanged('left', value);
    }
    [rightDrawerModeProperty.setNative](value: Mode) {
        this.onSideModeChanged('right', value);
    }
    [topDrawerModeProperty.setNative](value: Mode) {
        this.onSideModeChanged('top', value);
    }
    [bottomDrawerModeProperty.setNative](value: Mode) {
        this.onSideModeChanged('bottom', value);
    }
    [gestureHandlerOptionsProperty.setNative](value) {
        if (this.panGestureHandler) {
            Object.assign(this.panGestureHandler, value || {});
        }
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

    leftLayoutChanged(event: EventData) {
        return this.onLayoutChange('left', event);
    }

    rightLayoutChanged(event: EventData) {
        return this.onLayoutChange('right', event);
    }
    topLayoutChanged(event: EventData) {
        return this.onLayoutChange('top', event);
    }

    bottomLayoutChanged(event: EventData) {
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
        if (oldValue === newValue) {
            return;
        }
        this._onBackDropEnabledValueChanged();
        if (oldValue) {
            oldValue.off('layoutChanged', this[side + 'LayoutChanged'], this);
            this.removeChild(oldValue);
        }

        if (newValue) {
            // newValue.columns = "auto"
            if (side === 'left' || side === 'right') {
                newValue.horizontalAlignment = side;
            } else {
                newValue.verticalAlignment = side;
            }
            newValue.on('layoutChanged', this[side + 'LayoutChanged'], this);
            this.onSideModeChanged(side, this.mModes[side]);
        }
    }
    onSideModeChanged(side: Side | VerticalSide, mode: Mode, oldMode: Mode = this.mModes[side]) {
        if ((oldMode && oldMode === mode) || (oldMode && oldMode !== 'under' && mode !== 'under')) {
            return;
        }
        const drawer = this[side + 'Drawer'] as View;
        if (!drawer) {
            return;
        }
        const indexBack = this.backDrop ? this.getChildIndex(this.backDrop) : 0;
        const index = this.getChildIndex(drawer);
        drawer.visibility = this.mShowingSide === side ? 'visible' : 'hidden';

        if (mode === 'under') {
            if (index > indexBack - 1 && drawer.parent === this) {
                drawer.reusable = true;
                this.removeChild(drawer);
                this.insertChild(drawer, Math.max(indexBack - 1, 0));
            } else if (drawer.parent !== this) {
                // initial addition
                // this.backDrop.visibility = trData.backDrop && trData.backDrop.opacity > 0 ? 'visible' : 'hidden';
                this.insertChild(drawer, 0);
            }
        } else {
            if (index <= indexBack && drawer.parent === this) {
                drawer.reusable = true;
                this.removeChild(drawer);
                this.insertChild(drawer, indexBack + 1);
            } else if (drawer.parent !== this) {
                // initial addition
                this.insertChild(drawer, indexBack + 1);
            }
        }
    }
    computeTranslationData(side, value) {
        if (side === 'left' || side === 'right') {
            const width = this.mViewWidth[side];
            const delta = Math.max(width - value, 0);
            const progress = delta / width;
            if (this.translationFunction) {
                return this.translationFunction(side, width, value, delta, progress, this);
            }
            if (this.mModes[side] === 'under') {
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
            const height = this.mViewHeight[side];
            const delta = Math.max(height - value, 0);
            const progress = delta / height;
            if (this.translationFunction) {
                return this.translationFunction(side, height, value, delta, progress, this);
            }
            if (this.mModes[side] === 'under') {
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
        const viewWidth = Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredWidth());
        const viewHeight = Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredHeight());
        if (side === 'left' || side === 'right') {
            if (__IOS__ && !this.iosIgnoreSafeArea) {
                const deviceOrientation = UIDevice.currentDevice.orientation;
                if (deviceOrientation === UIDeviceOrientation.LandscapeLeft) {
                    safeAreaOffset = Application.ios.window.safeAreaInsets.left;
                } else if (deviceOrientation === UIDeviceOrientation.LandscapeRight) {
                    safeAreaOffset = Application.ios.window.safeAreaInsets.right;
                }
            }
            const width = Math.ceil(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredWidth()) + safeAreaOffset);
            const firstSet = this.mViewWidth[side] === undefined;
            changed = width !== this.mViewWidth[side];
            this.mViewWidth[side] = width;
            if (firstSet) {
                const offset = this.mShowingSide === side ? 0 : width;
                data = this.computeTranslationData(side, offset);
                const shown = this.mViewWidth[side] - offset;
                this.mTranslationX[side] = width - shown;
            } else {
                this.mTranslationX[side] = this.mTranslationX[side] === 0 ? 0 : width;
            }
        } else {
            safeAreaOffset = __IOS__ && !this.iosIgnoreSafeArea && Application.ios.window.safeAreaInsets ? Application.ios.window.safeAreaInsets.bottom : 0;
            const height = Math.ceil(viewHeight + safeAreaOffset);
            const firstSet = this.mViewHeight[side] === undefined;
            changed = height !== this.mViewHeight[side];
            this.mViewHeight[side] = height;
            if (firstSet) {
                const offset = this.mShowingSide === side ? 0 : height;
                data = this.computeTranslationData(side, offset);
                const shown = this.mViewHeight[side] - offset;
                this.mTranslationY[side] = height - shown;
            } else {
                this.mTranslationY[side] = this.mTranslationY[side] === 0 ? 0 : height;
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
            if (__IOS__ && !this.iosIgnoreSafeArea) {
                const deviceOrientation = UIDevice.currentDevice.orientation;
                if (deviceOrientation === 3) {
                    safeAreaOffset = Application.ios.window.safeAreaInsets.left;
                } else if (deviceOrientation === 4) {
                    safeAreaOffset = Application.ios.window.safeAreaInsets.right;
                }
            }
            const width = Math.ceil(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredWidth()) + safeAreaOffset);
            this.mViewWidth[side] = width;
        } else {
            safeAreaOffset = __IOS__ && !this.iosIgnoreSafeArea && Application.ios.window.safeAreaInsets ? Application.ios.window.safeAreaInsets.bottom : 0;
            const height = Math.ceil(Utils.layout.toDeviceIndependentPixels(contentView.getMeasuredHeight()) + safeAreaOffset);
            this.mViewHeight[side] = height;
        }
    }
    onTapGestureState(args: GestureStateEventData) {
        const { state } = args.data;
        if (state === GestureState.BEGAN) {
            this.close();
        }
    }
    updateIsPanning(state: GestureState) {
        this.mIsPanning = state === GestureState.ACTIVE || state === GestureState.BEGAN;
    }

    mViewByIdCache = {};
    applyTrData(trData: { [k: string]: any }, side: Side | VerticalSide) {
        const cache = this.mViewByIdCache;
        Object.keys(trData).forEach((k) => {
            let target = this[k] || cache[k];
            if (!target) {
                target = this.getViewById(k);
                if (target) {
                    cache[k] = target;
                }
            }
            if (target) {
                Object.assign(target, trData[k]);
            }
        });
    }

    constrainX(side, x) {
        const width = this.mViewWidth[side];
        if (x > 0) {
            return 0;
        } else if (x < -width) {
            return -width;
        }
        return x;
    }
    constrainY(side, y) {
        const height = this.mViewHeight[side];
        if (y > 0) {
            return 0;
        } else if (y < -height) {
            return -height;
        }
        return y;
    }

    async animateToPosition(side: Side | VerticalSide, position, duration = this.openAnimationDuration) {
        if (this.mShowingSide && side !== this.mShowingSide) {
            this.animateToPosition(this.mShowingSide, 0, duration);
        }
        const shouldSendEvent = side !== this.mShowingSide || (this.mShowingSide === side && position === 0);
        let trData;
        if (side === 'left' || side === 'right') {
            const width = this.mViewWidth[side];
            trData = this.computeTranslationData(side, width - position);
            this.mTranslationX[side] = width - position;
        } else {
            const height = this.mViewHeight[side];
            trData = this.computeTranslationData(side, height - position);
            this.mTranslationY[side] = height - position;
        }
        if (position !== 0) {
            this.mShowingSide = side;
            const drawer = this[side + 'Drawer'] as View;
            if (drawer) {
                drawer.visibility = 'visible';
            }
            if (this.backDrop && trData.backDrop && trData.backDrop.opacity > 0 && this.backDrop.visibility !== 'visible') {
                this.backDrop.opacity = 0;
                this.backDrop.visibility = 'visible';
            }
        } else {
            this.mShowingSide = null;
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
                if (this.animationFunction) {
                    await this.animationFunction(side, duration, trData, params, this);
                }
                await new Animation(params).play();
            }
        } catch (err) {
            console.error('animateToPosition', this, err, err.stack);
            throw err;
        } finally {
            // apply tr data to prevent hickups on iOS
            // and handle animation cancelled errors
            if ((position !== 0 && this.mShowingSide === side) || (position === 0 && !this.mShowingSide)) {
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
            if (shouldSendEvent) {
                if (position === 0) {
                    this.notify({ eventName: 'close', side, duration } as DrawerEventData);
                } else {
                    this.notify({ eventName: 'open', side, duration } as DrawerEventData);
                }
            }
        }
    }
    isSideOpened() {
        return !!this.mShowingSide;
    }

    isOpened(side?: Side | VerticalSide) {
        if (side) {
            return this.mShowingSide === side;
        }
        return !!this.mShowingSide;
    }
    getDefaultSide() {
        if (this.leftDrawer) {
            return 'left';
        } else if (this.rightDrawer) {
            return 'right';
        } else if (this.bottomDrawer) {
            return 'bottom';
        } else if (this.topDrawer) {
            return 'top';
        }
        return null;
    }
    async toggle(side?: Side | VerticalSide) {
        side = this.getActualSide(side) || this.getDefaultSide();
        if (!side) {
            return;
        }

        if (this.isOpened(side)) {
            this.close(side);
        } else {
            this.open(side);
        }
    }
    async open(side?: Side | VerticalSide, duration = this.openAnimationDuration) {
        side = this.getActualSide(side) || this.getDefaultSide();
        if (!side) {
            return;
        }
        if (this.mShowingSide && this.mShowingSide !== side) {
            this.close();
        }

        if (!this.isOpened(side)) {
            this.forceEnsureSize(side);
        }
        if (side === 'left' || side === 'right') {
            this.animateToPosition(side, this.mViewWidth[side], duration);
        } else {
            this.animateToPosition(side, this.mViewHeight[side], duration);
        }
    }
    async close(side?: Side | VerticalSide, duration = this.closeAnimationDuration) {
        side = this.getActualSide(side) || this.mShowingSide;
        if (!side) {
            return;
        }
        // this.mShowingSide = null;
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
animationFunctionProperty.register(Drawer);
backDropEnabledProperty.register(Drawer);
startingSideProperty.register(Drawer);
gestureHandlerOptionsProperty.register(Drawer);

export function install() {
    console.log('installing drawer gestures');
    installGestures();
}
