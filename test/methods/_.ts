import { clear, createStore, setMany } from 'idb-keyval';
import { createApi } from '../../src/methods';
import { addListener, cachedObj, reactCache, reactCacheEntry } from '../../src/shared';

export async function setupApi({cache: reactCache, cacheEntries, cacheObjects, cacheValues, idbObjects, idbValues, listen}: {
    cache?: reactCache,
    cacheEntries?: Record<string, reactCacheEntry>,
    cacheObjects?: Record<string, cachedObj>,
    cacheValues?: Record<string, unknown>,
    idbObjects?: Record<string, cachedObj>,
    idbValues?: Record<string, unknown>,
    listen?: string[],
} = {}): Promise<{
    cache: reactCache,
    store: ReturnType<typeof createStore>,
    rerender: jest.Mock<() => void>,
    listener: jest.Mock<() => void>,
    api: ReturnType<typeof createApi>,
}> {
    const cache: reactCache = reactCache ?? {}
    Object.entries(cacheEntries ?? {}).forEach(([key, entry]) => {
        cache[key] = entry
    })
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

    const listener = jest.fn()
    const listenerId = Math.random().toString(36)
    if (listen) {
        addListener(cache, listen, listenerId, listener)
    }

    const api = createApi(cache, store, 'testComponent', rerender)

    return {
        cache: cache as reactCache,
        store,
        rerender,
        listener,
        api,
    }
}
