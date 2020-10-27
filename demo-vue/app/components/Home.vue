<template>
    <Page >
        <Drawer ref="drawer" leftDrawerMode="slide">
            <ActionBar>
                <Label text="Vue.js Demo"/>
            </ActionBar>

            <StackLayout ~leftDrawer width="300" backgroundColor="blue">
                <StackLayout backgroundColor="green" margin="25" height="100">
                    <Label text="StackLayout (iOS left margin doesn't work)" />
                </StackLayout>
                <GridLayout backgroundColor="orange" margin="25" height="100">
                    <Label text="GridLayout (iOS left margin doesn't work)" />
                </GridLayout>
                <Label backgroundColor="red" margin="25" height="100" text="Just a Label (iOS left margin works!)" />
            </StackLayout>
            <StackLayout ~mainContent backgroundColor="white">
                <Label text="Main Content" />    
            </StackLayout>
        </Drawer> 
    </Page>
</template>

<script lang="typescript">
  export default {
    computed: {
      message() {
        return "Blank {N}-Vue app";
      }
    },
    methods: {
        onOpenDrawer() {
            this.$refs["drawer"].open("left");
        },
        onCloseDrawer() {
            this.$refs["drawer"].close("left");
        }
    }
  };
</script>

<style scoped lang="scss">
    @import '~@nativescript/theme/scss/variables/blue';

    ActionBar {
        background-color: #42b883;
    }

    .button {
        background-color: transparent;
        border-color: transparent;
        z-index:0;
        border-width: 1;
    }
</style>
