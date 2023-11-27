<script lang="ts">
export default {
    name: 'Layout',
};
</script>

<script lang="ts" setup></script>

<template>
    <div class="layout">
        <header>
            <RouterLink :to="{name: 'Home'}">Webpack Vue3 SSR Demo</RouterLink>
        </header>
        <main>
            <slot />
        </main>
        <footer>Fork me on &nbsp;<a target="_blank" href="https://github.com/EsunR/webpack-vue3-ssr">Github</a></footer>
    </div>
</template>

<style lang="scss" scoped>
.layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;

    header {
        height: 60px;
        background-color: #42b983;
        display: flex;
        align-items: center;
        justify-content: center;
        a {
            color: #fff;
            font-weight: bold;
            text-decoration: none;
        }
    }

    main {
        flex: 1;
        max-width: 1200px;
        margin: 0 auto;
    }

    footer {
        height: 40px;
        background-color: #42b983;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;

        a {
            color: #fff;
        }
    }
}
</style>
