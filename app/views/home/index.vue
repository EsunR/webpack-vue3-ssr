<script lang="ts" setup>
import {getTest} from '@/api/home';
import {useHomeStore} from '@/store/home';
import Counter from './components/Counter.vue';
import useStoreRequestSync from '@/hooks/useStoreRequestSync';

defineOptions({
    name: 'HomePage',
});

const homeStore = useHomeStore();

const {data: timeData} = useStoreRequestSync({
    fetchMethod: getTest,
    store: homeStore,
    stateKey: 'time',
});
</script>

<template>
    <div class="home-page">
        <h1>This page render with SSR</h1>
        <div>Server time: {{ timeData?.time }}</div>
        <div class="counter-wrapper">
            <span>You can try this counter components</span>
            <Counter />
        </div>
        <RouterLink :to="{name: 'NewsIndex'}">Navigate to News page</RouterLink>
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
        margin-top: 12px;
    }
}
</style>
