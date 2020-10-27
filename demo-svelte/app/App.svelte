<page>
    <actionBar title="Svelte Demo" />
    <drawer>
        <stacklayout prop:leftDrawer width="300" backgroundColor="red">
            <label text="bla bla bla" />
        </stacklayout>
    
        <stacklayout prop:mainDrawer>
            <label text="hello world" />
            <button on:tap="{onButtonTap}" text="tap me" />
        </stacklayout>
    </drawer>
</page>

<script lang="typescript">
    function onButtonTap() {
        console.log("hello world")
    }
</script>

<style>
    .info .fas {
        color: #3A53FF;
    }
    .info {
        font-size: 20;
    }
</style>
