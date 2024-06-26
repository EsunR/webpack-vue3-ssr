import { Store as DefaultStore, storeToRefs } from 'pinia';
import { Ref, onUnmounted, ref } from 'vue';

type DefaultFetchMethod = (...args: any) => Promise<any>;

declare type GetPromiseReturnType<T extends Promise<any>> = T extends Promise<infer R> ? R : never;

/**
 * 对外暴露 data 和 getData 方法
 * 调用 getData 后，会将获取到的数据存储到配置的 store 中，同时 data 会同步更新为 store 中存放的数据
 * 该方法在 SSR 场景下非常有用，客户端渲染时可以直接从 store 层拿到服务端预取的数据，并可以通过查看 data 是否为空来判断服务端是否预取了数据
 *
 * 注意：使用该 hook 会导致组件变为异步组件
 */
export async function useStoreRequest<
    FetchMethod extends DefaultFetchMethod,
    Store extends DefaultStore,
    Data extends GetPromiseReturnType<ReturnType<FetchMethod>>
>(option: {
    fetchMethod: FetchMethod;
    store: Store;
    stateKey: keyof Store['$state'];
    initParams?: Parameters<FetchMethod>;
}) {
    const {fetchMethod, store, stateKey, initParams} = option;
    const loading = ref(false);

    const getData = async (params?: Parameters<FetchMethod>[0]) => {
        try {
            loading.value = true;
            const data = await fetchMethod(params);
            if (data) {
                (store.$state as any)[stateKey] = data;
            }
            return data;
        } finally {
            loading.value = false;
        }
    };

    // 页面跳转后重置 store，否则在返回后不会重新拉取
    onUnmounted(() => {
        (store.$state as any)[stateKey] = undefined;
    });

    // 如果 store 中没有数据再拉取数据（避免 CSR 环境重复获取已经预取好的数据）
    if (!(store.$state as any)[stateKey]) {
        await getData(initParams);
    }

    return {
        getData,
        data: (storeToRefs(store) as any)[stateKey] as Ref<Data | undefined>,
    };
}

export default useStoreRequest;
