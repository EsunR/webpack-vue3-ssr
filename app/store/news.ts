import {GetNewsResponse} from '@/api/news';
import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useNewsStore = defineStore('news', () => {
    const news = ref<GetNewsResponse>();

    return {
        news,
    };
});
