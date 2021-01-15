import { createStore } from 'idb-keyval';
import { cachedObj, expire, reactCache } from '../shared';
import { clear } from './clear'
import { del } from './del'
import { get, getReturn } from './get'
import { set } from './set'

declare function boundClear(
    expire?: expire,
): Promise<void>;

declare function boundDel(
    key: string,
): Promise<void>;

declare function boundGet<
    K extends Parameters<typeof get>[3],
    T extends Parameters<typeof get>[6],
>(
    keyOrKeys: K,
    loader?: Parameters<typeof get>[4],
    expire?: Parameters<typeof get>[5],
    returnType?: T,
): getReturn<K, T>;

declare function boundSet(
    recordData: Record<string, cachedObj['data']>,
    recordMeta?: Record<string, cachedObj['meta'] | null>,
): Promise<void>;
declare function boundSet(
    key: string,
    data: cachedObj['data'],
    meta?: cachedObj['meta'],
): Promise<void>;

interface cachedApi {
    clear: typeof boundClear,
    del: typeof boundDel,
    get: typeof boundGet,
    set: typeof boundSet,
}

export function createApi(cache: reactCache, store: ReturnType<typeof createStore>, rerender: () => void): cachedApi {
    return {
        clear: clear.bind(undefined, cache, store) as typeof boundClear,
        del: del.bind(undefined, cache, store) as typeof boundDel,
        get: get.bind(undefined, cache, store, rerender) as typeof boundGet,
        set: set.bind(undefined, cache, store, rerender) as typeof boundSet,
    }
}
