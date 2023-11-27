<script lang="ts" setup>
import {storeToRefs} from 'pinia';
import {useNewsStore} from '@/store/news';
import {onMounted, onServerPrefetch, onUnmounted} from 'vue';

defineOptions({
    name: 'NewsPage',
});

const newsStore = useNewsStore();
const {news} = storeToRefs(newsStore);

onServerPrefetch(async () => {
    await newsStore.fetchNews();
});

onMounted(async () => {
    if (!news?.value) {
        await newsStore.fetchNews();
    }
});

onUnmounted(() => {
    newsStore.$reset();
});
</script>

<template>
    <div class="news-page">
        <h1 class="title">{{ news?.title }}</h1>
        <ul class="news-list">
            <li v-for="item in news?.items ?? []" :key="item.id" class="news-list__item">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="news-content" v-html="item.content_html"></div>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
.news-page {
    .title {
        color: rgba($color: #000000, $alpha: 0.8);
    }
    .news-list {
        padding: 0;
        list-style: none;
        .news-list__item {
            margin-bottom: 1rem;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 4px;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
}

::v-deep(.news-content) {
    blockquote {
        margin: 0;
        padding: 0px 20px;
        border-left: 5px solid rgba($color: #000000, $alpha: 0.2);
        background-color: rgba($color: #000000, $alpha: 0.05);
        overflow: hidden;
    }
    img {
        max-width: 100%;
        height: auto;
    }

    a {
        color: #007bff;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
