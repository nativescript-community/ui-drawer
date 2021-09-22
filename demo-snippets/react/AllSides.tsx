import * as React from 'react';
import { Drawer } from "@nativescript-community/ui-drawer/react";
import { Drawer as NativeScriptDrawer } from "@nativescript-community/ui-drawer";
import { NSVElement } from "react-nativescript";

export function AllSides() {
    const drawerRef = React.useRef<NSVElement<NativeScriptDrawer>>(null);

    function onOpenDrawer(side) {
        drawerRef.current!.nativeView.open(side);
    }

    return (
        <gridLayout>
            <Drawer ref={drawerRef} className="drawer">
                <gridLayout nodeRole="leftDrawer" backgroundColor="white" width="65%" padding="25">
                    <label verticalAlignment="top">Left Drawer</label>
                </gridLayout>

                <gridLayout nodeRole="rightDrawer" backgroundColor="white" width="65%" padding="25">
                    <label verticalAlignment="top">Right Drawer</label>
                </gridLayout>

                <gridLayout nodeRole="topDrawer" backgroundColor="white" height="65%" padding="25">
                    <label verticalAlignment="top">Top Drawer</label>
                </gridLayout>

                <gridLayout nodeRole="bottomDrawer" backgroundColor="white" height="65%" padding="25">
                    <label verticalAlignment="top">Bottom Drawer</label>
                </gridLayout>

                <stackLayout nodeRole="mainContent" backgroundColor="white">
                    <button onTap={() => onOpenDrawer('left')} text="Open Left Drawer" width="250" marginTop="25" />
                    <button onTap={() => onOpenDrawer('right')} text="Open Right Drawer" width="250" marginTop="25" />
                    <button onTap={() => onOpenDrawer('top')} text="Open Top Drawer" width="250" marginTop="25" />
                    <button onTap={() => onOpenDrawer('bottom')} text="Open Bottom Drawer" width="250" marginTop="25" />
                </stackLayout>
            </Drawer>
        </gridLayout>
    );
}