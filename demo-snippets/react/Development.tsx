import * as React from 'react';
import { Drawer } from "@nativescript-community/ui-drawer/react";
import { Drawer as NativeScriptDrawer } from "@nativescript-community/ui-drawer";
import { NSVElement } from "react-nativescript";

export function Development() {
    const drawerRef = React.useRef<NSVElement<NativeScriptDrawer>>(null);

    function onOpenDrawer() {
        drawerRef.current!.nativeView.open("left");
    }

    return (
        <gridLayout>
            <Drawer ref={drawerRef} className="drawer">
                <gridLayout nodeRole="leftDrawer" backgroundColor="white" width="65%" padding="25">
                    <label verticalAlignment="top">Left Drawer</label>
                </gridLayout>

                <stackLayout nodeRole="mainContent" backgroundColor="white">
                    <label textWrap="true">This development demo contains specific features that are tested in development.</label>
                    <button onTap={onOpenDrawer} text="Open Drawer" width="250" marginTop="25" />
                </stackLayout>
            </Drawer>
        </gridLayout>
    );
}
