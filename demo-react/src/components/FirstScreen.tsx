import * as React from "react";
import { RouteProp } from '@react-navigation/core';
import { FrameNavigationProp } from "react-nativescript-navigation";
import { MainStackParamList } from "./NavigationParamList";
import { Drawer } from "@nativescript-community/ui-drawer/react";
import { Drawer as NativeScriptDrawer } from "@nativescript-community/ui-drawer";
import { NSVElement } from "react-nativescript";

type FirstScreenProps = {
    route: RouteProp<MainStackParamList, "first">,
    navigation: FrameNavigationProp<MainStackParamList, "first">,
}

export function First({ navigation }: FirstScreenProps) {
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
                                    <label text="JS" />
                                </stackLayout>
                            </gridLayout>
                            <stackLayout>
                                <label text="John Smith" fontWeight="bold" />
                                <label text="john.smith@example.com" />
                            </stackLayout>
                        </stackLayout>
                        <stackLayout>
                            <button text="My Profile" className="button" onTap={onCloseDrawer} />
                            <button text="Settings" className="button" onTap={onCloseDrawer} />
                            <button text="Rate Us" className="button" onTap={onCloseDrawer} />
                            <button text="Support" className="button" onTap={onCloseDrawer} />
                            <button text="Contact" className="button" onTap={onCloseDrawer} />
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
