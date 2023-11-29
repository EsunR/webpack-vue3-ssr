import service from '@/utils/service';
import {defineStore} from 'pinia';

export interface INewsItem {
    content_html: string;
    date_published: string;
    id: string;
    title: string;
    url: string;
}

export interface INews {
    title: string;
    description: string;
    home_page_url: string;
    icon: string;
    language: string;
    version: string;
    items: INewsItem[];
}

interface INewsState {
    news?: INews;
}

export const useNewsStore = defineStore('news', {
    state: () =>
        ({
            news: undefined,
        } as INewsState),
    actions: {
        async fetchNews() {
            const {data} = await service.get('/rsshub/telegram/channel/testflightcn.json');
            this.news = data;
        },
    },
});
