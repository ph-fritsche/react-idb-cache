import { DBDriver } from '../driver/abstract'
import { cachedObj, delProperty, dispatch, Keys, options, reactCache, setProperty } from '../shared'

export function set(
    cache: reactCache,
    driver: DBDriver,
    recordData: Record<string, cachedObj['data']>,
    recordMeta?: Record<string, cachedObj['meta'] | null>,
    options?: options,
): Promise<void>;
export function set(
    cache: reactCache,
    driver: DBDriver,
    key: string,
    data: cachedObj['data'],
    meta?: cachedObj['meta'],
    options?: options,
): Promise<void>;
export async function set(
    cache: reactCache,
    driver: DBDriver,
    ...args: unknown[]
): Promise<void> {
    if (typeof args[0] == 'string') {
        return _set(
            cache,
            driver,
            { [args[0]]: { data: args[1], meta: args[2] } } as Record<string, cachedObj>,
            args[3] as options,
        )
    } else {
        return _set(
            cache,
            driver,
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
    driver: DBDriver,
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
        await driver.setMany(entries)
    }

    const updateKeys: (keyof reactCache)[] = []
    for (const [key, obj] of entries) {

        if (obj) {
            updateKeys.push(key)

            setProperty(cache, [key, 'obj'], obj)
            if (options.skipIdb) {
                cache[key].isVolatile = true
            }

        } else if(cache[key]?.obj) {
            updateKeys.push(key)

            delProperty(cache, [key, 'obj'])
            delProperty(cache, [key, 'isVolatile'])
        }
    }

    if (updateKeys.length) {
        updateKeys.push(Keys)
        dispatch(cache, updateKeys)
    }
}
