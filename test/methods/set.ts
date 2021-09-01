import NullDB from '../../src/driver/NullDB'
import { Keys } from '../../src/shared'
import { setupApi } from './_'

it('set value', async () => {
    const { api, cache, driver, listener } = await setupApi({listen: ['foo']})

    await api.set('foo', 'bar')

    expect(cache.foo?.obj).toEqual(expect.objectContaining({data: 'bar'}))
    await expect(driver.getMany(['foo'])).resolves.toEqual([expect.objectContaining({data: 'bar'})])
    expect(listener).toBeCalledTimes(1)
})

it('set multiple values', async () => {
    const { api, cache, driver, listener } = await setupApi({
        cacheValues: {foo: undefined},
        listen: ['foo'],
    })

    await api.set({foo: 'bar', fuu: 'baz'})

    expect(cache.foo?.obj).toEqual(expect.objectContaining({ data: 'bar' }))
    expect(cache.fuu?.obj).toEqual(expect.objectContaining({ data: 'baz' }))
    await expect(driver.getMany(['foo', 'fuu'])).resolves.toEqual([
        expect.objectContaining({data: 'bar'}),
        expect.objectContaining({data: 'baz'}),
    ])
    expect(listener).toBeCalledTimes(1)
})

it('set value with meta', async () => {
    const { api, cache, driver, listener } = await setupApi({listen: ['foo']})

    await api.set('foo', 'bar', {someMeta: 'someMetaValue'})

    expect(cache.foo?.obj).toEqual({
        data: 'bar',
        meta: expect.objectContaining({someMeta: 'someMetaValue'}),
    })
    await expect(driver.getMany(['foo'])).resolves.toEqual([{
        data: 'bar',
        meta: expect.objectContaining({ someMeta: 'someMetaValue' }),
    }])
    expect(listener).toBeCalledTimes(1)
})

it('set multiple values with meta', async () => {
    const { api, cache, driver, listener } = await setupApi({listen: ['foo', 'fuu']})

    await api.set({foo: 'bar', fuu: 'baz'}, {
        foo: {someMeta: 'someMetaValue'},
        fuu: {someMeta: 'otherMetaValue'},
    })

    expect(cache.foo?.obj).toEqual({
        data: 'bar',
        meta: expect.objectContaining({someMeta: 'someMetaValue' }),
    })
    expect(cache.fuu?.obj).toEqual({
        data: 'baz',
        meta: expect.objectContaining({someMeta: 'otherMetaValue' }),
    })
    await expect(driver.getMany(['foo', 'fuu'])).resolves.toEqual([
        {
            data: 'bar',
            meta: expect.objectContaining({ someMeta: 'someMetaValue' }),
        },
        {
            data: 'baz',
            meta: expect.objectContaining({ someMeta: 'otherMetaValue' }),
        },
    ])
    expect(listener).toBeCalledTimes(1)
})

it('unset per meta=null', async () => {
    const { api, cache, driver, listener } = await setupApi({
        idbValues: {foo: 'bar', fuu: 'baz'},
        listen: ['foo', 'fuu'],
    })

    await api.set({ foo: 'newValue', fuu: 'doesNotMatter' }, {
        fuu: null,
    })

    expect(cache.foo?.obj).toEqual(expect.objectContaining({ data: 'newValue' }))
    expect(cache.fuu?.obj).toEqual(undefined)
    await expect(driver.getMany(['foo', 'fuu'])).resolves.toEqual([
        expect.objectContaining({ data: 'newValue' }),
        undefined,
    ])
    expect(listener).toBeCalledTimes(1)
})

it('preserve promises when unsetting entries', async () => {
    const { cache, api } = await setupApi({
        cacheEntries: {
            foo: {
                promise: new Promise(() => { return }),
                obj: { data: 'foo', meta: {} },
            },
        },
    })

    await api.set({foo: 'any'}, {foo: null})

    expect(cache).toEqual({
        foo: {
            promise: expect.any(Promise),
        },
    })
})

it('skip idb', async () => {
    const { api, cache, driver } = await setupApi()

    await api.set('foo', 'bar', undefined, {skipIdb: true})

    expect(cache.foo?.obj?.data).toBe('bar')
    await expect(driver.getMany(['foo'])).resolves.toEqual([undefined])
})

it('trigger Keys listener when setting entry', async () => {
    const { api, listener } = await setupApi({
        dbDriverFactory: NullDB,
        listen: [Keys],
    })

    await api.set({ foo: 123 })

    expect(listener).toBeCalledTimes(1)

    await api.set({ foo: undefined }, {foo: null})

    expect(listener).toBeCalledTimes(2)

    await api.set({ foo: undefined }, {foo: null})

    expect(listener).toBeCalledTimes(2)
})
