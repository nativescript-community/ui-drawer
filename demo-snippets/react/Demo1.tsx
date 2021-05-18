import * as React from 'react';
import { Drawer } from "@nativescript-community/ui-drawer/react";
import { Drawer as NativeScriptDrawer } from "@nativescript-community/ui-drawer";
import { NSVElement } from "react-nativescript";


export function Demo1() {
    const drawerRef = React.useRef<NSVElement<NativeScriptDrawer>>(null);

    function onOpenDrawer() {
        drawerRef.current!.nativeView.open("left");
    }

    function onCloseDrawer() {
        drawerRef.current!.nativeView.close("left");
    }

    return (
        <gridLayout>
            <Drawer ref={drawerRef} className="drawer">
                <gridLayout nodeRole="leftDrawer" backgroundColor="white" width="300">
                    <stackLayout row={0}>
                        <stackLayout backgroundColor="#eeeeee" padding="25">
                            <gridLayout columns="80, *" height="100">
                                <stackLayout col={0} className="avatar">
                                    <label>JS</label>
                                </stackLayout>
                            </gridLayout>
                            <stackLayout>
                                <label fontWeight="bold">John Smith</label>
                                <label>john.smith@example.com</label>
                            </stackLayout>
                        </stackLayout>
                        <stackLayout>
                            <button className="button" onTap={onCloseDrawer}>My Profile</button>
                            <button className="button" onTap={onCloseDrawer}>Settings</button>
                            <button className="button" onTap={onCloseDrawer}>Rate Us</button>
                            <button className="button" onTap={onCloseDrawer}>Support</button>
                            <button className="button" onTap={onCloseDrawer}>Contact</button>
                        </stackLayout>
                    </stackLayout>
                </gridLayout>

                <stackLayout nodeRole="mainContent" backgroundColor="white">
                    <button onTap={onOpenDrawer} text="Open Drawer" width="250" marginTop="25" />
                </stackLayout>
            </Drawer>
        </gridLayout>
    );
}
