import { setMany } from 'idb-keyval'
import { cachedObj, delProperty, dispatch, options, reactCache, setProperty } from '../shared'

export function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    recordData: Record<string, cachedObj['data']>,
    recordMeta?: Record<string, cachedObj['meta'] | null>,
    options?: options,
): Promise<void>;
export function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    key: string,
    data: cachedObj['data'],
    meta?: cachedObj['meta'],
    options?: options,
): Promise<void>;
export async function set(
    cache: reactCache,
    store: Parameters<typeof setMany>[1],
    ...args: unknown[]
): Promise<void> {
    if (typeof args[0] == 'string') {
        return _set(
            cache,
            store,
            { [args[0]]: { data: args[1], meta: args[2] } } as Record<string, cachedObj>,
            args[3] as options,
        )
    } else {
        return _set(
            cache,
            store,
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
            setProperty(cache, [key, 'obj'], obj)
        } else {
            delProperty(cache, [key, 'obj'])
        }
    })

    dispatch(cache, entries.map(([key]) => key))
}
