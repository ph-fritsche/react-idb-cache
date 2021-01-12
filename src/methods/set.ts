import { set as idbSet } from 'idb-keyval'
import { reactCache } from '../shared'
import { cachedObj } from '../useCached'

export function set(
    cache: reactCache,
    store: Parameters<typeof idbSet>[1],
    key: string,
    data: cachedObj['data'],
    meta?: cachedObj['meta'],
): void {
    cache[key].obj = {
        data,
        meta: {
            date: new Date(),
            ...meta,
        },
    }
    idbSet(key, { data, meta }, store)
}
