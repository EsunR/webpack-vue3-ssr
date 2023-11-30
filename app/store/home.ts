import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useHomeStore = defineStore('home', () => {
    const time = ref<string>();

    return {
        time,
    };
});
