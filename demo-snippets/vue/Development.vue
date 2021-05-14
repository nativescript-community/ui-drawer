<template>
    <Page>
        <ActionBar>
            <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
            <Label text="Development Demo" />
        </ActionBar>

        <StackLayout>
            <Label text="This is the development demo..." />
        </StackLayout>
    </Page>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped></style>
