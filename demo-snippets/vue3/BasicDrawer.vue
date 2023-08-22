<template>
    <Page>
        <ActionBar>
            <NavigationButton text="Back" @tap="$navigateBack" />
            <Label text="Basic Drawer" />
        </ActionBar>

        <Drawer ref="drawer" :gestureHandlerOptions="{
            failOffsetYStart: -10,
            failOffsetYEnd: 10
        }">

            <!-- <GridLayout ~leftDrawer class="drawer" width="80%" backgroundColor="white" rows="auto, *">
                <StackLayout backgroundColor="#eeeeee" padding="25">
                    <GridLayout columns="80, *" height="100">
                        <StackLayout col="0" class="avatar">
                            <Label text="JS" />
                        </StackLayout>
                    </GridLayout>
                    <StackLayout>
                        <Label text="John Smith" fontWeight="bold" />
                        <Label text="john.smith@example.com" />
                    </StackLayout>
                </StackLayout>
                <ListView row="1" :items="items">
                    <template>
                        <Label :text="item.title" @tap="onCloseDrawer" />
                    </template>
                </ListView>
            </GridLayout> -->

            <StackLayout ~mainContent backgroundColor="white">
                <Button @tap="onOpenDrawer" text="Open Drawer" width="250" marginTop="25" />
            </StackLayout>
        </Drawer>
    </Page>
</template>

<script setup lang="ts">
import { ref, $navigateBack, computed } from "nativescript-vue"

const drawer = ref(null);

const items = computed(() => {
    return new Array(100).fill({ title: 'My profile' });
});

function onOpenDrawer(side: string) {
    drawer.open(side);
}

function onCloseDrawer() {
    drawer.close('left');
}

</script>

<style scoped lang="scss">
ActionBar {
    background-color: #42b883;
    color: white;
}

Button {
    background-color: #42b883;
    color: white;
}

.avatar {
    background-color: #42b883;
    border-radius: 40;
    height: 80;
    vertical-align: middle;

    Label {
        vertical-align: middle;
        horizontal-align: center;
        font-size: 30;
        color: white;
    }
}

.drawer {
    Button {
        background-color: transparent;
        margin: 0;
        padding: 0;
        border-color: #ccc;
        z-index: 0;
        border-width: 0 0 0.5 0;
        color: #222222;
        text-align: left;
        padding-left: 25;
        height: 50;
        font-size: 14;
    }

    Button:highlighted {
        background-color: #eeeeee;
        color: #222222;
    }
}
</style>
