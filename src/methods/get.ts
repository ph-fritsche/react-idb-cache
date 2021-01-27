import { getMany } from 'idb-keyval'
import { addListener, cachedObj, debugLog, dispatch, expire, reactCache, setProperty, verifyEntry } from '../shared'

type returnTypes<T> = {
    data: cachedObj<T>['data'],
    obj: cachedObj<T> & {valid: boolean},
}

export type getValue<
    R extends keyof returnTypes<T> | undefined,
    T extends unknown = unknown
> = (R extends keyof returnTypes<T> ? returnTypes<T>[R] : returnTypes<T>['data']) | undefined

export type getReturn<
    K extends string | string[],
    R extends keyof returnTypes<T> | undefined,
    T extends unknown = unknown,
> = K extends string[]
    ? { [k in K[number]]: getValue<R, T> }
    : getValue<R, T>

export function get<
    K extends string | string[],
    T extends unknown = unknown,
>(
    cache: reactCache,
    store: Parameters<typeof getMany>[1],
    id: string,
    rerender: () => void,
    keyOrKeys: K,
    loader?: (missingKeys: string[]) => Promise<void>,
    expire?: expire | undefined,
    returnType?: undefined,
): getReturn<K, undefined, T>;
export function get<
    K extends string | string[],
    R extends keyof returnTypes<T> | undefined,
    T extends unknown = unknown,
>(
    cache: reactCache,
    store: Parameters<typeof getMany>[1],
    id: string,
    rerender: () => void,
    keyOrKeys: K,
    loader?: (missingKeys: string[]) => Promise<void>,
    expire?: expire,
    returnType?: R,
): getReturn<K, R, T>;

export function get<
    K extends string | string[],
    R extends keyof returnTypes<T> | undefined,
    T extends unknown = unknown,
>(
    cache: reactCache,
    store: Parameters<typeof getMany>[1],
    id: string,
    rerender: () => void,
    keyOrKeys: K,
    loader?: (missingKeys: string[]) => Promise<void>,
    expire?: expire,
    returnType?: R,
): getReturn<K, R, T> {
    const keys = (Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]) as string[]

    addListener(cache, keys, id, rerender)

    const values: Record<string, getValue<R, T>> = {}
    const missing: string[] = []

    keys.forEach(key => {
        const valid = verifyEntry(cache[key], expire)
        if(!cache[key].promise && !valid) {
            missing.push(key)
        }
        if (returnType === 'obj') {
            values[key] = (cache[key].obj ? { ...cache[key].obj, valid } : undefined) as getValue<R, T>
        } else {
            values[key] = cache[key].obj?.data as getValue<R, T>
        }
    })

    if (missing.length) {
        debugLog('Get from idb: %s', missing.join(', '))

        const idbPromise = getMany(missing, store).then(
            obj => {
                debugLog.enabled && debugLog(
                    '  -> received from idb:\n%s',
                    missing.map((k, i) => `\t${k}: ${JSON.stringify(obj[i])}`).join('\n'),
                )

                const stillMissing: string[] = []
                const hit: string[] = []
                obj.forEach((obj, i) => {
                    if (verifyEntry({ obj }, expire)) {
                        setProperty(cache, [missing[i], 'obj'], obj)
                        hit.push(missing[i])
                    } else {
                        stillMissing.push(missing[i])
                    }
                })

                dispatch(cache, hit)

                const loaderPromise = typeof loader === 'function' ? loader(stillMissing) : undefined

                if (loaderPromise) {
                    stillMissing.forEach(key => {
                        cache[key].promise = loaderPromise.then(() => cache[key].obj)
                        loaderPromise.finally(() => { delete cache[key].promise })
                    })

                    return missing.map(key => stillMissing.includes(key) ? cache[key].promise : cache[key].obj)
                } else {
                    stillMissing.forEach(key => { delete cache[key].promise })
                    return missing.map(key => cache[key].obj)
                }
            },
        )

        missing.forEach((key, i) => {
            setProperty(cache, [key, 'promise'], idbPromise.then(values => values[i]))
        })
    }

    return (Array.isArray(keyOrKeys) ? values : values[keys[0]]) as getReturn<K, R, T>
}
