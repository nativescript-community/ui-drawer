<template>
    <Page>
        <ActionBar>
            <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
            <Label text="All Sides" />
        </ActionBar>

        <Drawer ref="drawer">
            <GridLayout ~leftDrawer class="drawer" width="65%" height="100%" backgroundColor="white" padding="25">
                <Label text="Left Drawer" verticalAlignment="top" />
            </GridLayout>

            <GridLayout ~rightDrawer class="drawer" width="65%" height="100%" backgroundColor="white" padding="25">
                <Label text="Right Drawer" verticalAlignment="top" />
            </GridLayout>

            <GridLayout ~topDrawer class="drawer" height="65%" width="100%" backgroundColor="white" padding="25">
                <Label text="Top Drawer" verticalAlignment="top" />
            </GridLayout>

            <GridLayout ~bottomDrawer class="drawer" height="65%" width="100%" backgroundColor="white" padding="25">
                <Label text="Bottom Drawer" verticalAlignment="top" />
            </GridLayout>

            <StackLayout ~mainContent backgroundColor="white">
                <Button @tap="onOpenDrawer('left')" text="Open Left Drawer" width="250" marginTop="25" />
                <Button @tap="onOpenDrawer('right')" text="Open Right Drawer" width="250" marginTop="25" />
                <Button @tap="onOpenDrawer('top')" text="Open Top Drawer" width="250" marginTop="25" />
                <Button @tap="onOpenDrawer('bottom')" text="Open Bottom Drawer" width="250" marginTop="25" />
            </StackLayout>
        </Drawer>
    </Page>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    computed: {
        message() {
            return 'Blank {N}-Vue app';
        }
    },
    methods: {
        onOpenDrawer(side: string) {
            this.$refs['drawer'].open(side);
        }
    }
});
</script>

<style lang="scss" scoped></style>
