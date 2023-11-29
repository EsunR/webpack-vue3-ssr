<script lang="ts">
export default {
    name: 'HomePage',
};
</script>

<script lang="ts" setup>
import Counter from './components/Counter.vue';
</script>

<template>
    <div class="home-page">
        <h1>This page render with SSR</h1>
        <div class="counter-wrapper">
            <span>You can try this counter components</span>
            <Counter />
        </div>
        <RouterLink :to="{name: 'News'}">Navigate to News page</RouterLink>
    </div>
</template>

<style lang="scss" scoped>
.home-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    .counter-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}
</style>
