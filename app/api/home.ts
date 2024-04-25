import service from '@/utils/service';

export interface TestResponse {
    time: string;
}

export async function getTest() {
    return (await service.get('/api/test')) as TestResponse;
}
