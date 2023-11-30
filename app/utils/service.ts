import axios from 'axios';
import {IS_NODE} from './const';
import {SSR_SERVER_PORT} from '@server/config';

const service = axios.create({});

service.interceptors.request.use(config => {
    if (IS_NODE) {
        // 服务端预取数据时的设置
        if (process.env.VERCEL) {
            config.baseURL = `https://${process.env.VERCEL_URL}`;
        } else {
            config.baseURL = `http://localhost:${SSR_SERVER_PORT}`;
        }
    }
    return config;
});

service.interceptors.response.use(response => {
    return response.data;
});

export default service;
