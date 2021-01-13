import { setMany } from 'idb-keyval'
import { cachedObj, reactCache } from '../shared'

export function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    rerender: () => void,
    record: Record<string, {data: cachedObj['data'], meta?: cachedObj['meta']} | undefined>,
): void;
export function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    rerender: () => void,
    key: string,
    data: cachedObj['data'],
    meta?: cachedObj['meta'],
): void;
export function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    rerender: () => void,
    keyOrRecord: string | Record<string, { data: cachedObj['data'], meta?: cachedObj['meta'] } | undefined>,
    data?: cachedObj['data'],
    meta?: cachedObj['meta'],
): void {
    const record = typeof keyOrRecord === 'string' ? { [keyOrRecord]: {data, meta}} : keyOrRecord

    const entries = Object.entries(record).map(([key, obj]): [string, { data: cachedObj['data'], meta: cachedObj['meta'] } | undefined] => {
        if (typeof obj === 'object') {
            const {data, meta} = obj
            return [key, {
                data,
                meta: {
                    date: new Date(),
                    ...meta,
                },
            }]
        }
        return [key, undefined]
    })

    entries.forEach(([key, obj]) => {
        if (obj) {
            cache[key].obj = obj
        } else if(cache[key].promise) {
            delete cache[key].obj
        } else {
            delete cache[key]
        }
    })
    setMany(entries, store)

    rerender()
}
