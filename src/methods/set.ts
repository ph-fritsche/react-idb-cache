import { setMany } from 'idb-keyval'
import { cachedObj, options, reactCache } from '../shared'

export function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    rerender: () => void,
    recordData: Record<string, cachedObj['data']>,
    recordMeta?: Record<string, cachedObj['meta'] | null>,
    options?: options,
): Promise<void>;
export function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    rerender: () => void,
    key: string,
    data: cachedObj['data'],
    meta?: cachedObj['meta'],
    options?: options,
): Promise<void>;
export async function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    rerender: () => void,
    ...args: unknown[]
): Promise<void> {
    if (typeof args[0] == 'string') {
        return _set(
            cache,
            store,
            rerender,
            { [args[0]]: { data: args[1], meta: args[2] } } as Record<string, cachedObj>,
            args[3] as options,
        )
    } else {
        return _set(
            cache,
            store,
            rerender,
            Object.assign({}, ...Object
                .entries(args[0] as Record<string, cachedObj['data']>)
                .map(([key, data]) => {
                    const meta = (args[1] as Record<string, cachedObj['meta']> ?? {})[key]

                    return meta === null
                        ? { [key]: undefined }
                        : { [key]: { data, meta } }
                }),
            ),
            args[2] as options,
        )
    }
}

async function _set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    rerender: () => void,
    record: Record<string, { data: cachedObj['data'], meta?: cachedObj['meta'] } | undefined>,
    options: options = {},
): Promise<void> {
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

    if (!options.skipIdb) {
        await setMany(entries, store)
    }

    entries.forEach(([key, obj]) => {
        if (obj) {
            cache[key] = cache[key] ?? {}
            cache[key].obj = obj
        } else if(cache[key]?.promise) {
            delete cache[key].obj
        } else {
            delete cache[key]
        }
    })

    rerender()
}
