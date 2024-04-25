<script lang="ts" setup>
import {ref} from 'vue';

defineOptions({
    name: 'Counter',
});

const count = ref<number>(0);

const addCount = (num: number) => {
    count.value += num;
};
</script>

<template>
    <div class="counter">
        <h3 class="counter-number">{{ count }}</h3>
        <div class="counter-operation">
            <button @click="addCount(1)">+</button>
            <button @click="addCount(-1)">-</button>
        </div>
    </div>
</template>

<style scoped>
.counter {
    display: flex;
    align-items: center;
}

.counter-number {
    margin-right: 10px;
}

.counter-operation button {
    width: 50px;
    margin-right: 10px;
}
</style>
