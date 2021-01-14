import { getMany, keys } from 'idb-keyval'
import { setupApi } from './_'

it('clear all values', async () => {
    const { cache, store, api } = await setupApi({cacheValues: {foo: 'bar'}, idbValues: {fuu: 'baz'}})

    await api.clear()

    expect(Object.keys(cache)).toHaveLength(0)
    await expect(keys(store)).resolves.toEqual([])
})

it('clear values per expire', async () => {
    const { cache, store, api } = await setupApi({
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
    })

    await api.clear((obj) => (obj.meta.someMeta as number) > 1)

    expect(Object.keys(cache)).toHaveLength(0)
    await expect(getMany(['foo', 'fuu', 'faa'], store)).resolves.toEqual([
        expect.any(Object),
        undefined,
        undefined,
    ])
})

it('preserve promises', async () => {
    const { cache, api } = await setupApi({
        cacheEntries: {
            foo: {
                promise: new Promise(() => { return }),
                obj: {data: 'foo', meta: {}},
            },
        },
    })

    await api.clear()

    expect(cache).toEqual({
        foo: {
            promise: expect.any(Promise),
        },
    })
})
