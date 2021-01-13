import { clear, createStore, get, set, setMany } from 'idb-keyval';
import { createApi } from '../../src/methods';
import { cachedObj, reactCache } from '../../src/shared';

export async function setupApi({cacheObjects, cacheValues, idbObjects, idbValues}: {
    cacheObjects?: Record<string, cachedObj>,
    cacheValues?: Record<string, unknown>,
    idbObjects?: Record<string, cachedObj>,
    idbValues?: Record<string, unknown>,
} = {}): Promise<{
    cache: reactCache,
    store: ReturnType<typeof createStore>,
    rerender: jest.Mock<() => void>,
    api: ReturnType<typeof createApi>,
}> {
    const cache: reactCache = {}
    Object.entries(cacheObjects ?? {}).forEach(([key, obj]) => {
        cache[key] = {obj}
    })
    Object.entries(cacheValues ?? {}).forEach(([key, data]) => {
        cache[key] = {obj: { data, meta: { date: new Date('2001-02-03T04:05:06') } }}
    })

    const store = createStore('test', 'teststore')
    await clear(store)

    const entries: [string, cachedObj][] = [
        ...Object.entries(idbObjects ?? {}),
        ...Object.entries(idbValues ?? {}).map(([key, data]): [string, cachedObj] =>
            [key, {data, meta: {date: new Date('2001-02-03T04:05:06')}}],
        ),
    ]
    if (entries.length) {
        await setMany(entries, store)
    }

    const rerender = jest.fn()

    const api = createApi(cache, store, rerender)

    return {
        cache: cache as reactCache,
        store,
        rerender,
        api,
    }
}
