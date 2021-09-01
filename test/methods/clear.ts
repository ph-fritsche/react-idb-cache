import NullDB from '../../src/driver/NullDB'
import { Keys } from '../../src/shared'
import { setupApi } from './_'

it('clear all values', async () => {
    const { cache, api, listener } = await setupApi({
        cacheValues: {foo: 'bar'},
        idbValues: {fuu: 'baz'},
        listen: ['foo'],
    })

    // this entry has no data that changes so the listener will not be called
    const fuuListener = jest.fn()
    cache.fuu = { listeners: {'fuu': fuuListener} }

    await api.clear()

    expect(cache.foo?.obj).toBe(undefined)
    expect(cache.fuu?.obj).toBe(undefined)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(fuuListener).not.toBeCalled()
})

it('clear values per expire', async () => {
    const { cache, api, driver, listener } = await setupApi({
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
    await expect(driver.getMany(['foo', 'fuu', 'faa'])).resolves.toEqual([
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

    expect(cache).toEqual(expect.objectContaining({
        foo: {
            promise: expect.any(Promise),
        },
        fuu: {
            listeners: {'listenerId': expect.any(Function)},
        },
    }))
})

it('trigger Keys listener when clearing', async () => {
    const { api, listener } = await setupApi({
        dbDriverFactory: NullDB,
        cacheValues: {
            foo: 123,
            bar: 456,
        },
        listen: [Keys],
    })

    await api.clear((v) => v.data === 123)

    expect(listener).toBeCalledTimes(1)

    await api.clear(() => false)

    expect(listener).toBeCalledTimes(1)

    await api.clear(() => true)

    expect(listener).toBeCalledTimes(2)
})
