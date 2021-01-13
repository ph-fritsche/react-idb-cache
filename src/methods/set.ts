import { setMany } from 'idb-keyval'
import { cachedObj, reactCache } from '../shared'

export function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    rerender: () => void,
    recordData: Record<string, cachedObj['data']>,
    recordMeta?: Record<string, cachedObj['meta'] | null>,
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
    ...args: unknown[]
): void {
    const record: Record<string, {data: cachedObj['data'], meta?: cachedObj['meta']} | undefined>
        = typeof args[0] === 'string'
            ? { [ args[0] ]: {data: args[1], meta: args[2]} }
            : Object.assign({}, ...Object
                .entries(args[1] as Record<string, cachedObj['data']>)
                .map(([key, data]) => {
                    const meta = (args[2] as Record<string, cachedObj['meta']>)[key]
                    return meta === null ? {[key]: undefined} : {[key]: {data, meta}}
                }),
            )

    const entries = Object.entries(record).map(([key, obj]): [string, cachedObj | undefined] => {
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
