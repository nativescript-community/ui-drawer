<script lang="ts">
    import { Template } from 'svelte-native/components';
    import { ContentView, ObservableArray } from '@nativescript/core';
    import { GC } from '@nativescript/core/utils';
    import { Drawer } from '@nativescript-community/ui-drawer';
    import { NativeViewElementNode } from 'svelte-native/dom';
    import { CollectionView } from '@nativescript-community/ui-collectionview';

    let collectionView: NativeViewElementNode<CollectionView>;
    let items = new ObservableArray([
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

    function onItemTap({ index, item }) {
        console.log(`EVENT TRIGGERED: Tapped on ${index} ${item.name}`);
    }
    function onLoadMoreItems() {
        console.log('EVENT TRIGGERED: onLoadMoreItems()');
        items.push(...items);
    }

    function refresh() {
        items = new ObservableArray([
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
    }

    // function onNavigatedFrom() {
    //     console.log('onNavigatedFrom')
    //     setTimeout(()=>{
    //         GC()
    //     }, 10)
    // }
    function drawerTranslationFunction(side, width, value, delta, progress) {
        const result = {
            mainContent: {
                translateX: side === 'right' ? -delta : delta
            }
        } as any;

        return result;
    }
    let openedDrawerIndex: number;
    async function onItemMenuStart(item, event) {
        console.log('onItemMenuStart', event.object, openedDrawerIndex);
        if (openedDrawerIndex >= 0) {
            try {
                const view = collectionView.nativeView.getViewForItemAtIndex(openedDrawerIndex);
                openedDrawerIndex = -1;
                if (view) {
                    console.log('view', view, (view as ContentView).content);
                    ((view as ContentView).content as Drawer).close();
                } else {
                    delete item.startingSide;
                    items.setItem(openedDrawerIndex, item);
                }
                // await openedDrawer.close();
            } catch (error) {
                console.error(error);
            }
            // openedDrawerIndex = -1;
        }
    }
    function onItemMenuOpened(item, event) {
        const index = items.findIndex((i) => i.color === item.color);
        openedDrawerIndex = index;
        console.log('onItemMenuOpened', index, event.object);
        // items.setItem(index, { ...item, startingSide: 'left' });
        item.startingSide = event.object.startingSide = 'left';
        event.object.updateStartingSide('left')
    }
    function onItemMenuClosed(item, event) {
        const index = items.findIndex((i) => i.color === item.color);
        console.log('onItemMenuClosed', index, event.object);
        delete item.startingSide;
        // items.setItem(index, item);
        // openedDrawerIndex = -1;
        event.object.updateStartingSide(null)
        // item.startingSide = event.object.startingSide = null;
    }

    function getItemStartingSide(item) {
        console.log('getItemStartingSide', item);
        return item.startingSide;
    }
</script>

<page>
    <actionBar title="Simple Grid">
        <actionItem on:tap={refresh} ios.systemIcon="16" ios.position="right" text="refresh" android.position="popup" />
    </actionBar>
    <gridLayout>
        <collectionView {items} rowHeight="100" automationText="collectionView" bind:this={collectionView}>
            <Template let:item>
                <drawer
                    id={item.name}
                    gestureHandlerOptions={{ activeOffsetXStart: -10, activeOffsetXEnd: 10, failOffsetYStart: -10, failOffsetYEnd: 10, minDist: 15 }}
                    leftSwipeDistance="300"
                    leftOpenedDrawerAllowDraging={true}
                    iosIgnoreSafeArea={true}
                    leftDrawerMode="under"
                    translationFunction={drawerTranslationFunction}
                    backDropEnabled={false}
                    startingSide={getItemStartingSide(item)}
                    on:start={(event) => onItemMenuStart(item, event)}
                    on:open={(event) => onItemMenuOpened(item, event)}
                    on:close={(event) => onItemMenuClosed(item, event)}
                >
                    <gridlayout rows="*, auto" backgroundColor={item.color} class="item" prop:mainContent width="100%">
                        <stacklayout row="1">
                            <label row="1" text={item.name} class="title" />
                            <label row="1" text={item.color} class="subtitle" />
                        </stacklayout>
                    </gridlayout>
                    <stacklayout prop:leftDrawer orientation="horizontal" width="200">
                        <label text={item.menuOpened ? 'opened' : 'a'} width="100" height="100%" backgroundColor="red" textAlignment="center" />
                        <label text="b" width="100" height="100%" backgroundColor="blue" textAlignment="center" />
                    </stacklayout>
                </drawer>
            </Template>
        </collectionView>
    </gridLayout>
</page>

<style>
    ActionBar {
        background-color: #ed3e04;
        color: white;
    }
    .item {
        padding: 10;
        color: white;
    }
    .title {
        font-size: 17;
        font-weight: bold;
    }
    .subtitle {
        font-size: 14;
    }
</style>
