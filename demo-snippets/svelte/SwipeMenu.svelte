<script lang="ts">
    import { Template } from 'svelte-native/components';
    import { ContentView, ObservableArray } from '@nativescript/core';
    import { GC } from '@nativescript/core/utils';
    import { Drawer } from '@nativescript-community/ui-drawer';
    import { NativeViewElementNode } from 'svelte-native/dom';
    import { CollectionView } from '@nativescript-community/ui-collectionview';

    let collectionView: NativeViewElementNode<CollectionView>;
    let items = new ObservableArray([
        { index: 0, name: 'TURQUOISE', color: '#1abc9c', startingSide: 'none' },
        { index: 1, name: 'EMERALD', color: '#2ecc71', startingSide: 'none' },
        { index: 2, name: 'PETER RIVER', color: '#3498db', startingSide: 'none' },
        { index: 3, name: 'AMETHYST', color: '#9b59b6', startingSide: 'none' },
        { index: 4, name: 'WET ASPHALT', color: '#34495e', startingSide: 'none' },
        { index: 5, name: 'GREEN SEA', color: '#16a085', startingSide: 'none' },
        { index: 6, name: 'NEPHRITIS', color: '#27ae60', startingSide: 'none' },
        { index: 7, name: 'BELIZE HOLE', color: '#2980b9', startingSide: 'none' },
        { index: 8, name: 'WISTERIA', color: '#8e44ad', startingSide: 'none' },
        { index: 9, name: 'MIDNIGHT BLUE', color: '#2c3e50', startingSide: 'none' },
        { index: 10, name: 'SUN FLOWER', color: '#f1c40f', startingSide: 'none' },
        { index: 11, name: 'CARROT', color: '#e67e22', startingSide: 'none' },
        { index: 12, name: 'ALIZARIN', color: '#e74c3c', startingSide: 'none' },
        { index: 13, name: 'CLOUDS', color: '#ecf0f1', startingSide: 'none' },
        { index: 14, name: 'CONCRETE', color: '#95a5a6', startingSide: 'none' },
        { index: 15, name: 'ORANGE', color: '#f39c12', startingSide: 'none' },
        { index: 16, name: 'PUMPKIN', color: '#d35400', startingSide: 'none' },
        { index: 17, name: 'POMEGRANATE', color: '#c0392b', startingSide: 'none' },
        { index: 18, name: 'SILVER', color: '#bdc3c7', startingSide: 'none' },
        { index: 19, name: 'ASBESTOS', color: '#7f8c8d', startingSide: 'none' }
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

    async function closeCurrentMenu() {
        try {
            const view = collectionView.nativeView.getViewForItemAtIndex(openedDrawerIndex);
            console.log('closeCurrentMenu', openedDrawerIndex, view);
            if (view) {
                console.log('view', view, (view as ContentView).content);
                ((view as ContentView).content as Drawer).close();
            } else {
                const oldItem = items.getItem(openedDrawerIndex);
                oldItem.startingSide = 'none';
                items.setItem(openedDrawerIndex, oldItem);
            }
        } catch (error) {
            console.error(error);
        } finally {
        }
    }
    async function onItemMenuStart(item, event) {
        const index = items.findIndex((i) => i.color === item.color);
        if (openedDrawerIndex >= 0) {
            closeCurrentMenu();
        }
        openedDrawerIndex = index;
    }
    function onItemMenuOpened(item, event) {
        const index = items.findIndex((i) => i.color === item.color);
        console.log('onItemMenuOpened', index, event.object, openedDrawerIndex);
        if (openedDrawerIndex >= 0 && openedDrawerIndex !== index) {
            closeCurrentMenu();
        }
        openedDrawerIndex = index;
        item.startingSide = event.object.startingSide = 'left';
        items.setItem(index, item);
    }
    function onItemMenuClosed(item, event) {
        const index = items.findIndex((i) => i.color === item.color);
        console.log('onItemMenuClosed', index, event.object, openedDrawerIndex);
        if (item.startingSide !== 'none') {
            if (index === openedDrawerIndex) {
                openedDrawerIndex = -1;
            }
            item.startingSide = event.object.startingSide = 'none';
            items.setItem(index, item);
        }
    }

    $: console.log('startingSide', startingSide);
    let drawer;
    let startingSide = null;
    function swithTest() {
        const newValue = startingSide === 'left' ? null : 'left';
        // if (drawer.nativeElement) {
        //     drawer.nativeElement.startingSide = newValue;
        // }
        startingSide = newValue;
    }
</script>

<page>
    <actionBar title="Simple Grid">
        <actionItem on:tap={refresh} ios.systemIcon="16" ios.position="right" text="refresh" android.position="popup" />
    </actionBar>
    <gridLayout rows="auto,*">
        <drawer
            id="test"
            bind:this={drawer}
            gestureHandlerOptions={{ activeOffsetXStart: -10, activeOffsetXEnd: 10, failOffsetYStart: -10, failOffsetYEnd: 10, minDist: 15 }}
            leftSwipeDistance="300"
            leftOpenedDrawerAllowDraging={true}
            iosIgnoreSafeArea={true}
            leftDrawerMode="under"
            translationFunction={drawerTranslationFunction}
            backDropEnabled={false}
            {startingSide}
        >
            <gridlayout rows="*, auto" backgroundColor="green" class="item" prop:mainContent width="100%">
                <stacklayout row="1" on:tap={swithTest}>
                    <label row="1" text="green" class="title" />
                    <label row="1" text={startingSide} class="subtitle" />
                </stacklayout>
            </gridlayout>
            <stacklayout prop:leftDrawer orientation="horizontal" width="200">
                <label text="a" width="100" height="100%" backgroundColor="red" textAlignment="center" />
                <label text="b" width="100" height="100%" backgroundColor="blue" textAlignment="center" />
            </stacklayout>
        </drawer>
        <collectionView {items} row="1" rowHeight="100" automationText="collectionView" bind:this={collectionView}>
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
                    startingSide={item.startingSide}
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
