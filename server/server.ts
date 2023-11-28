import app from './app';
import {SSR_SERVER_PORT} from './config';
import {log} from './utils/log';

app.listen(SSR_SERVER_PORT, () => {
    log('success', `Server is listening on port ${SSR_SERVER_PORT}`);
});
