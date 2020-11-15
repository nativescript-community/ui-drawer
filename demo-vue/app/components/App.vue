<template>
    <Page>
        <ActionBar>
            <Label text="Vue.js Demo" />
        </ActionBar>

        <Drawer ref="drawer">
            <GridLayout ~leftDrawer class="drawer" width="300" backgroundColor="white" rows="auto, *">
                <StackLayout row="0">
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
                    <StackLayout>
                        <Button text="My Profile" @tap="onCloseDrawer" />
                        <Button text="Settings" @tap="onCloseDrawer" />
                        <Button text="Rate Us" @tap="onCloseDrawer" />
                        <Button text="Support" @tap="onCloseDrawer" />
                        <Button text="Contact" @tap="onCloseDrawer" />
                    </StackLayout>
                </StackLayout>
            </GridLayout>

            <StackLayout ~mainContent backgroundColor="white">
                <Button @tap="onOpenDrawer" text="Open Drawer" width="250" marginTop="25" />
                <CollectionView
                    automationText="collectionView"
                    iosOverflowSafeArea="true"
                    :items="itemList"
                    itemIdGenerator="index"
                    colWidth="50%"
                    rowHeight="200"
                >
                    <v-template>
                        <GridLayout rows="*, auto" :backgroundColor="item.color" class="item">
                            <StackLayout row="1">
                                <Label row="1" :text="item.name" class="title" />
                                <Label row="1" :text="item.color" class="subtitle" />
                            </StackLayout>
                        </GridLayout>
                    </v-template>
                </CollectionView>
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
  data() {
      const items = [
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
      ];
      return {
          itemList: items
      };
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
