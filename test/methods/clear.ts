import { getMany, keys } from 'idb-keyval'
import { setupApi } from './_'

it('clear all values', async () => {
    const { cache, store, api, listener } = await setupApi({
        cacheValues: {foo: 'bar'},
        idbValues: {fuu: 'baz'},
        listen: ['fuu'],
    })

    await api.clear()

    expect(cache.foo?.obj).toBe(undefined)
    expect(cache.fuu?.obj).toBe(undefined)
    await expect(keys(store)).resolves.toEqual([])
    expect(listener).toHaveBeenCalledTimes(1)
})

it('clear values per expire', async () => {
    const { cache, store, api, listener } = await setupApi({
        cacheObjects: {
            foo: {
                data: 'anything',
                meta: {someMeta: 1},
            },
            fuu: {
                data: 'anything',
                meta: {someMeta: 2},
            },
            faa: {
                data: 'anything',
                meta: {someMeta: 3},
            },
        },
        idbObjects: {
            foo: {
                data: 'anything',
                meta: { someMeta: 1 },
            },
            fuu: {
                data: 'anything',
                meta: { someMeta: 2 },
            },
            faa: {
                data: 'anything',
                meta: { someMeta: 3 },
            },
        },
        listen: ['foo', 'fuu', 'faa'],
    })

    await api.clear((obj) => (obj.meta.someMeta as number) > 1)

    expect(cache.foo.obj).toEqual({
        data: 'anything',
        meta: { someMeta: 1 },
    })
    expect(cache.fuu.obj).toBe(undefined)
    expect(cache.faa.obj).toBe(undefined)
    await expect(getMany(['foo', 'fuu', 'faa'], store)).resolves.toEqual([
        {
            data: 'anything',
            meta: { someMeta: 1 },
        },
        undefined,
        undefined,
    ])
    expect(listener).toHaveBeenCalledTimes(1)
})

it('preserve promises and listeners', async () => {
    const { cache, api } = await setupApi({
        cacheEntries: {
            foo: {
                promise: new Promise(() => { return }),
                obj: {data: 'foo', meta: {}},
            },
            fuu: {
                listeners: {'listenerId': () => { return }},
                obj: {data: 'fuu', meta: {}},
            },
        },
    })

    await api.clear()

    expect(cache).toEqual({
        foo: {
            promise: expect.any(Promise),
        },
        fuu: {
            listeners: {'listenerId': expect.any(Function)},
        },
    })
})
