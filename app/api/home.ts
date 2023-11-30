import service from '@/utils/service';

export interface ITestResponse {
    time: string;
}

export async function getTest() {
    return (await service.get('/api/test')) as ITestResponse;
}
