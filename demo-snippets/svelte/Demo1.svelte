<style>
</style>

<page>
    <actionBar title="Demo 1">
        <navigationButton text="Go back" on:tap={goBack} />
    </actionBar>
    <stackLayout>
        <label text="The version is:" />
        <versionNumber />
    </stackLayout>
</page>

<script lang="typescript">
    import { goBack } from 'svelte-native';
</script>
