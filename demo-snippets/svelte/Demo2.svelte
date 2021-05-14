<style>
</style>

<page>
    <actionBar title="Demo 2">
        <navigationButton text="Go back" on:tap={goBack} />
    </actionBar>
    <stackLayout><label text="This is the second demo..." /></stackLayout>
</page>

<script lang="typescript">
    import { goBack } from 'svelte-native';
</script>
