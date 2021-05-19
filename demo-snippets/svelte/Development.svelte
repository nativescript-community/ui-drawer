<style>
</style>

<page>
    <actionBar title="Development">
        <navigationButton text="Go back" />
    </actionBar>
    <stackLayout>

        <drawer bind:this="{drawer}" class="drawer">
            <gridlayout prop:leftDrawer width="300" backgroundColor="white" padding="25">
                <label text="Left Drawer" verticalAlignment="top" />
            </gridlayout>
        
            <stacklayout prop:mainContent backgroundColor="white">
                <label textWrap="true" text="This development demo contains specific features that are tested in development." />
                <button on:tap="{onOpenDrawer}" text="Open Drawer" width="250" marginTop="25" />
            </stacklayout>
        </drawer>
    </stackLayout>
</page>

<script lang="typescript">
    import { Drawer } from "@nativescript-community/ui-drawer";
    let drawer: Drawer;
    function onOpenDrawer() {
        drawer.open();
    }

</script>
