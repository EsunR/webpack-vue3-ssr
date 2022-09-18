<template>
    <div class="home-page">
        <h1>this is home page !</h1>
        <Counter/>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Counter from './components/Counter.vue';

export default defineComponent({
    name: "HomePage",
    components: { Counter },
    setup() {
        return {};
    }
});
</script>

<style scoped>
.home-page {
    background-color: pink;
}
</style>
