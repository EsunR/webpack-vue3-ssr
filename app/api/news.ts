import service from '@/utils/service';

export interface GetNewsResponse {
    title: string;
    description: string;
    home_page_url: string;
    icon: string;
    language: string;
    version: string;
    items: {
        content_html: string;
        date_published: string;
        id: string;
        title: string;
        url: string;
    }[];
}

export async function getNews() {
    return (await service.get('/rsshub/telegram/channel/testflightcn.json')) as GetNewsResponse;
}
