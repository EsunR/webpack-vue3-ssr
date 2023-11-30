import {Store as DefaultStore, storeToRefs} from 'pinia';
import safeOnServerPrefetch from './safeOnServerPrefetch';
import {Ref, onMounted, onUnmounted, ref} from 'vue';

type DefaultFetchMethod = (...args: any) => Promise<any>;

declare type GetPromiseReturnType<T extends Promise<any>> = T extends Promise<infer R> ? R : never;

export function useStoreRequest<
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
    9;
    safeOnServerPrefetch(async () => {
        await getData(initParams);
    });

    onMounted(async () => {
        if ((store.$state as any)[stateKey]) {
            return;
        }
        await getData(initParams);
    });

    onUnmounted(() => {
        (store.$state as any)[stateKey] = undefined;
    });

    return {
        getData,
        data: (storeToRefs(store) as any)[stateKey] as Ref<Data | undefined>,
    };
}

export default useStoreRequest;
