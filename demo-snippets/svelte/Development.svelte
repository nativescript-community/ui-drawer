<style>
</style>

<page>
    <actionBar title="Development">
        <navigationButton text="Go back" on:tap={goBack} />
    </actionBar>
    <stackLayout><label text="This is the development demo..." /></stackLayout>
</page>

<script lang="typescript">
    import { goBack } from 'svelte-native';
</script>
