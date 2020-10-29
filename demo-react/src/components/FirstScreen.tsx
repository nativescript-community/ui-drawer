import * as React from "react";
import { RouteProp } from '@react-navigation/core';
import { NativeStackNavigationProp } from "react-nativescript-navigation";
import { MainStackParamList } from "./NavigationParamList";
import { Drawer } from "@nativescript-community/ui-drawer/react";

type FirstScreenProps = {
    route: RouteProp<MainStackParamList, "first">,
    navigation: NativeStackNavigationProp<MainStackParamList, "first">,
}

export function First({ navigation }: FirstScreenProps) {
    function onButtonTap() {
        navigation.navigate('second');
    }

    return (
        <gridLayout>
            <drawer>
                <gridLayout className={"leftDrawer"} backgroundColor={"white"}>
                    <label fontSize={24} text={"You're viewing the second route!"} />
                </gridLayout>

                <stackLayout className={"mainContent"} backgroundColor={"white"}>
                    <label fontSize={24} text={"You're viewing the second route!"} />
                </stackLayout>
            </drawer>
        </gridLayout>
    );
}
