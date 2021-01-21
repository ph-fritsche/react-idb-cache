import { createStore } from 'idb-keyval';
import { cachedObj, expire, options, reactCache } from '../shared';
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
    K extends Parameters<typeof get>[4],
    T extends Parameters<typeof get>[7],
>(
    keyOrKeys: K,
    loader?: Parameters<typeof get>[5],
    expire?: Parameters<typeof get>[6],
    returnType?: T,
): getReturn<K, T>;

declare function boundSet(
    recordData: Record<string, cachedObj['data']>,
    recordMeta?: Record<string, cachedObj['meta'] | null>,
    options?: options,
): Promise<void>;
declare function boundSet(
    key: string,
    data: cachedObj['data'],
    meta?: cachedObj['meta'],
    options?: options,
): Promise<void>;

interface cachedApi {
    clear: typeof boundClear,
    del: typeof boundDel,
    get: typeof boundGet,
    set: typeof boundSet,
}

export function createApi(cache: reactCache, store: ReturnType<typeof createStore>, id: string, rerender: () => void): cachedApi {
    return {
        clear: clear.bind(undefined, cache, store) as typeof boundClear,
        del: del.bind(undefined, cache, store) as typeof boundDel,
        get: get.bind(undefined, cache, store, id, rerender) as typeof boundGet,
        set: set.bind(undefined, cache, store) as typeof boundSet,
    }
}
