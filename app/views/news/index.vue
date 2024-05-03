<script lang="ts" setup>
import NewsList from './components/NewsList.vue';

defineOptions({
    name: 'NewsPage',
});
</script>

<template>
    <div class="news-page">
        <Suspense>
            <template #default>
                <NewsList />
            </template>
            <template #fallback>
                <p>Loading...</p>
            </template>
        </Suspense>
    </div>
</template>