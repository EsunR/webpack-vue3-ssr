<script lang="ts" setup>
import {useHomeStore} from '@/store/home';
import Counter from './components/Counter.vue';
import useStoreRequest from '@/hooks/useStoreRequest';
import {getTest} from '@/api/home';

defineOptions({
    name: 'HomePage',
});

const homeStore = useHomeStore();

const {data: timeData} = useStoreRequest({
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
