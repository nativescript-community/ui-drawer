
import * as React from 'react';
import { Drawer } from "@nativescript-community/ui-drawer/react";
import { Drawer as NativeScriptDrawer } from "@nativescript-community/ui-drawer";
import { StyleSheet } from "react-nativescript";
import { NSVElement } from "react-nativescript";


export function BasicDrawer() {
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
                                <stackLayout col={0} style={styles.avatar}>
                                    <label style={styles.avatarLabel}>JS</label>
                                </stackLayout>
                            </gridLayout>
                            <stackLayout>
                                <label fontWeight="bold">John Smith</label>
                                <label>john.smith@example.com</label>
                            </stackLayout>
                        </stackLayout>
                        <stackLayout>
                            <button style={styles.drawerButton} onTap={onCloseDrawer}>My Profile</button>
                            <button style={styles.drawerButton} onTap={onCloseDrawer}>Settings</button>
                            <button style={styles.drawerButton} onTap={onCloseDrawer}>Rate Us</button>
                            <button style={styles.drawerButton} onTap={onCloseDrawer}>Support</button>
                            <button style={styles.drawerButton} onTap={onCloseDrawer}>Contact</button>
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

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: "#61DBFB",
        borderRadius: 40,
        height: 80,
        verticalAlignment: "middle"
    },
    avatarLabel: {
        verticanAlignment: "middle",
        horizontalAlignment: "center",
        fontSize: 30,
        color: "white"
    },
    drawerButton: {
        backgroundColor: "transparent",
        margin: 0,
        padding: 0,
        color: "#222222",
        textAlignment: "left",
        paddingLeft: 25,
        height: 50,
        fontSize: 14
    }
});