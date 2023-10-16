<template>
    <Page>
        <ActionBar>
            <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
            <Label text="All Sides" />
        </ActionBar>

        <GridLayout rows="auto,*">
            <Drawer
                ref="drawer"
                gestureHandlerOptions="{ activeOffsetXStart: -10, activeOffsetXEnd: 10, failOffsetYStart: -10, failOffsetYEnd: 10, minDist: 15 }"
                leftSwipeDistance="300"
                leftOpenedDrawerAllowDraging="true"
                iosIgnoreSafeArea="true"
                leftDrawerMode="under"
                :translationFunction="drawerTranslationFunction"
                backDropEnabled="false"
                :startingSide="startingSide"
            >
                <Gridlayout rows="*, auto" backgroundColor="green" class="item" ~mainContent width="100%">
                    <Stacklayout row="1" @tap="swithTest">
                        <Label row="1" text="green" class="title" />
                        <Label row="1" text="startingSide" class="subtitle" />
                    </Stacklayout>
                </Gridlayout>
                <Stacklayout ~leftDrawer orientation="horizontal" width="200">
                    <Label text="a" width="100" height="100%" backgroundColor="red" textAlignment="center" />
                    <Label text="b" width="100" height="100%" backgroundColor="blue" textAlignment="center" />
                </Stacklayout>
            </Drawer>
            <CollectionView :items="items" row="1" rowHeight="100" automationText="collectionView" ref="collectionView">
                <v-template>
                    <Drawer
                        :gestureHandlerOptions="{ activeOffsetXStart: -10, activeOffsetXEnd: 10, failOffsetYStart: -10, failOffsetYEnd: 10, minDist: 15 }"
                        leftSwipeDistance="300"
                        :leftOpenedDrawerAllowDraging="true"
                        :iosIgnoreSafeArea="true"
                        leftDrawerMode="under"
                        :translationFunction="drawerTranslationFunction"
                        :backDropEnabled="false"
                        :startingSide="item.startingSide"
                        @start="onItemMenuStart(item, $event)"
                        @open="onItemMenuOpened(item, $event)"
                        @close="onItemMenuClosed(item, $event)"
                    >
                        <Gridlayout rows="*, auto" :backgroundColor="item.color" class="item" ~mainContent width="100%">
                            <Stacklayout row="1">
                                <Label row="1" :text="item.name" class="title" />
                                <Label row="1" :text="item.color" class="subtitle" />
                            </Stacklayout>
                        </Gridlayout>
                        <Stacklayout ~leftDrawer orientation="horizontal" width="200">
                            <Label :text="item.menuOpened ? 'opened' : 'a'" width="100" height="100%" backgroundColor="red" textAlignment="center" />
                            <Label text="b" width="100" height="100%" backgroundColor="blue" textAlignment="center" />
                        </Stacklayout>
                    </Drawer>
                </v-template>
            </CollectionView>
        </GridLayout>
    </Page>
</template>

<script lang="ts">
import Vue from 'vue';
import { Drawer } from '@nativescript-community/ui-drawer';
import { CollectionView } from '@nativescript-community/ui-collectionview';
import { ContentView, ObservableArray } from '@nativescript/core';
export default Vue.extend({
    computed: {
        message() {
            return 'Blank {N}-Vue app';
        }
    },
    data() {
        return {
            startingSide: null,
            item: undefined, // only for vetur errors
            openedDrawerIndex: -1,
            items: new ObservableArray([
                { index: 0, name: 'TURQUOISE', color: '#1abc9c', startingSide: null },
                { index: 1, name: 'EMERALD', color: '#2ecc71', startingSide: null },
                { index: 2, name: 'PETER RIVER', color: '#3498db', startingSide: null },
                { index: 3, name: 'AMETHYST', color: '#9b59b6', startingSide: null },
                { index: 4, name: 'WET ASPHALT', color: '#34495e', startingSide: null },
                { index: 5, name: 'GREEN SEA', color: '#16a085', startingSide: null },
                { index: 6, name: 'NEPHRITIS', color: '#27ae60', startingSide: null },
                { index: 7, name: 'BELIZE HOLE', color: '#2980b9', startingSide: null },
                { index: 8, name: 'WISTERIA', color: '#8e44ad', startingSide: null },
                { index: 9, name: 'MIDNIGHT BLUE', color: '#2c3e50', startingSide: null },
                { index: 10, name: 'SUN FLOWER', color: '#f1c40f', startingSide: null },
                { index: 11, name: 'CARROT', color: '#e67e22', startingSide: null },
                { index: 12, name: 'ALIZARIN', color: '#e74c3c', startingSide: null },
                { index: 13, name: 'CLOUDS', color: '#ecf0f1', startingSide: null },
                { index: 14, name: 'CONCRETE', color: '#95a5a6', startingSide: null },
                { index: 15, name: 'ORANGE', color: '#f39c12', startingSide: null },
                { index: 16, name: 'PUMPKIN', color: '#d35400', startingSide: null },
                { index: 17, name: 'POMEGRANATE', color: '#c0392b', startingSide: null },
                { index: 18, name: 'SILVER', color: '#bdc3c7', startingSide: null },
                { index: 19, name: 'ASBESTOS', color: '#7f8c8d', startingSide: null }
            ])
        };
    },
    methods: {
        onOpenDrawer(side: string) {
            this.$refs['drawer'].open(side);
        },
        onItemTap({ index, item }) {
            console.log(`EVENT TRIGGERED: Tapped on ${index} ${item.name}`);
        },
        onLoadMoreItems() {
            console.log('EVENT TRIGGERED: onLoadMoreItems()');
            this.items.push(...this.items);
        },

        refresh() {
            this.items = new ObservableArray([
                { index: 0, name: 'TURQUOISE', color: '#1abc9c' },
                { index: 1, name: 'EMERALD', color: '#2ecc71' },
                { index: 2, name: 'PETER RIVER', color: '#3498db' },
                { index: 3, name: 'AMETHYST', color: '#9b59b6' },
                { index: 4, name: 'WET ASPHALT', color: '#34495e' },
                { index: 5, name: 'GREEN SEA', color: '#16a085' },
                { index: 6, name: 'NEPHRITIS', color: '#27ae60' },
                { index: 7, name: 'BELIZE HOLE', color: '#2980b9' },
                { index: 8, name: 'WISTERIA', color: '#8e44ad' },
                { index: 9, name: 'MIDNIGHT BLUE', color: '#2c3e50' },
                { index: 10, name: 'SUN FLOWER', color: '#f1c40f' },
                { index: 11, name: 'CARROT', color: '#e67e22' },
                { index: 12, name: 'ALIZARIN', color: '#e74c3c' },
                { index: 13, name: 'CLOUDS', color: '#ecf0f1' },
                { index: 14, name: 'CONCRETE', color: '#95a5a6' },
                { index: 15, name: 'ORANGE', color: '#f39c12' },
                { index: 16, name: 'PUMPKIN', color: '#d35400' },
                { index: 17, name: 'POMEGRANATE', color: '#c0392b' },
                { index: 18, name: 'SILVER', color: '#bdc3c7' },
                { index: 19, name: 'ASBESTOS', color: '#7f8c8d' }
            ]);
        },

        // function onNavigatedFrom() {
        //     console.log('onNavigatedFrom')
        //     setTimeout(()=>{
        //         GC()
        //     }, 10)
        // }
        drawerTranslationFunction(side, width, value, delta, progress) {
            const result = {
                mainContent: {
                    translateX: side === 'right' ? -delta : delta
                }
            } as any;

            return result;
        },

        closeCurrentMenu() {
            try {
                const view = this.$refs.collectionView.nativeView.getViewForItemAtIndex(this.openedDrawerIndex);
                console.log('closeCurrentMenu', this.openedDrawerIndex, view);
                if (view) {
                    console.log('view', view, (view as ContentView).content);
                    ((view as ContentView).content as Drawer).close();
                } else {
                    const oldItem = this.items.getItem(this.openedDrawerIndex);
                    oldItem.startingSide = null;
                    this.items.setItem(this.openedDrawerIndex, oldItem);
                }
            } catch (error) {
                console.error(error);
            } finally {
            }
        },
        onItemMenuStart(item, event) {
            const index = this.items.findIndex((i) => i.color === item.color);
            if (this.openedDrawerIndex >= 0) {
                this.closeCurrentMenu();
            }
            this.openedDrawerIndex = index;
        },
        onItemMenuOpened(item, event) {
            const index = this.items.findIndex((i) => i.color === item.color);
            console.log('onItemMenuOpened', index, event.object, this.openedDrawerIndex);
            if (this.openedDrawerIndex >= 0 && this.openedDrawerIndex !== index) {
                this.closeCurrentMenu();
            }
            this.openedDrawerIndex = index;
            item.startingSide = event.object.startingSide = 'left';
            this.items.setItem(index, item);
        },
        onItemMenuClosed(item, event) {
            const index = this.items.findIndex((i) => i.color === item.color);
            console.log('onItemMenuClosed', index, event.object, this.openedDrawerIndex);
            if (item.startingSide !== null) {
                if (index === this.openedDrawerIndex) {
                    this.openedDrawerIndex = -1;
                }
                item.startingSide = event.object.startingSide = null;
                this.items.setItem(index, item);
            }
        },

        swithTest() {
            const newValue = this.startingSide === 'left' ? null : 'left';
            // if (drawer.nativeElement) {
            //     drawer.nativeElement.startingSide = newValue;
            // }
            this.startingSide = newValue;
        }
    }
});
</script>

<style lang="scss" scoped></style>
