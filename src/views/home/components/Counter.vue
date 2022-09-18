<template>
    <div class="counter">
        <h3 class="counter-number">{{ count }}</h3>
        <div class="counter-operation">
            <button @click="addCount(1)">+</button>
            <button @click="addCount(-1)">-</button>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

export default defineComponent({
    name: 'Counter',
    setup() {
        const count = ref<number>(0);

        const addCount = (num: number) => {
            count.value += num;
        };

        return {
            count,
            addCount,
        };
    },
});
</script>

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
