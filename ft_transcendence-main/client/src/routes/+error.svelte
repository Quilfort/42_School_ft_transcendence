<script lang="ts">
	import { page } from '$app/stores';
</script>

<style>
    h1 {
        color: red;
        font-family: "Lucida Console", "Courier New", monospace;
        text-decoration: overline;
        text-align: center;
        font-weight: bold;
        border: 2px solid black;
        outline: #4CAF50 solid 10px;
        margin: 20px;
        font-size: 40px;

    }
</style>

<main>
    <h1>{$page.status}</h1>

    <iframe class="w-full aspect-video" src="https://www.youtube.com/embed/StTqXEQ2l-Y?si=wnqRS1rOXXLUwrif"
        title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
    </iframe>
</main>

