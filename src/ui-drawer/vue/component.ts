export default {
    props: {},

    template: `
    <NativeDrawer
      ref="drawer"
      v-bind="$attrs"
      v-on="$listeners">
      <slot />
    </NativeDrawer>
  `,

    methods: {
        open(side) {
            return this.$refs.drawer.nativeView.open(side);
        },
        close(side) {
            return this.$refs.drawer.nativeView.close(side);
        },
        isOpened(side) {
            return this.$refs.drawer.nativeView.isOpened(side);
        },
        toggle(side) {
            return this.$refs.drawer.nativeView.toggle(side);
        },
    },
};
