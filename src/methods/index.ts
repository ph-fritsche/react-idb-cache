import { createStore } from 'idb-keyval';
import { cachedObj, expire, reactCache } from '../shared';
import { clear } from './clear'
import { del } from './del'
import { get } from './get'
import { set } from './set'

declare function boundClear(
    expire?: expire,
): void;

declare function boundDel(
    key: string,
): void;

declare function boundGet<T extends string, U = { [K in T]: unknown }>(
    keyArray: T[],
    loader?: (missingKeys: string[]) => Promise<void>,
    expire?: expire,
): U;
declare function boundGet(
    key: string,
    loader?: () => Promise<void>,
    expire?: expire,
): unknown;

declare function boundSet(
    record: Record<string, { data: cachedObj['data'], meta?: cachedObj['meta'] } | undefined>,
): void;
declare function boundSet(
    key: string,
    data: cachedObj['data'],
    meta?: cachedObj['meta'],
): void;

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
