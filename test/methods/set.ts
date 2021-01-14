import { get, getMany } from 'idb-keyval'
import { setupApi } from './_'

it('set value', async () => {
    const { cache, store, rerender, api } = await setupApi()

    await api.set('foo', 'bar')

    expect(cache.foo?.obj).toEqual(expect.objectContaining({data: 'bar'}))
    await expect(get('foo', store)).resolves.toEqual(expect.objectContaining({data: 'bar'}))
    expect(rerender).toBeCalledTimes(1)
})

it('set multiple values', async () => {
    const { cache, store, rerender, api } = await setupApi({cacheValues: {foo: undefined}})

    await api.set({foo: 'bar', fuu: 'baz'})

    expect(cache.foo?.obj).toEqual(expect.objectContaining({ data: 'bar' }))
    expect(cache.fuu?.obj).toEqual(expect.objectContaining({ data: 'baz' }))
    await expect(getMany(['foo', 'fuu'], store)).resolves.toEqual([
        expect.objectContaining({data: 'bar'}),
        expect.objectContaining({data: 'baz'}),
    ])
    expect(rerender).toBeCalledTimes(1)
})

it('set value with meta', async () => {
    const { cache, store, rerender, api } = await setupApi()

    await api.set('foo', 'bar', {someMeta: 'someMetaValue'})

    expect(cache.foo?.obj).toEqual({
        data: 'bar',
        meta: expect.objectContaining({someMeta: 'someMetaValue'}),
    })
    await expect(get('foo', store)).resolves.toEqual({
        data: 'bar',
        meta: expect.objectContaining({ someMeta: 'someMetaValue' }),
    })
    expect(rerender).toBeCalledTimes(1)
})

it('set multiple values with meta', async () => {
    const { cache, store, rerender, api } = await setupApi()

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
    await expect(getMany(['foo', 'fuu'], store)).resolves.toEqual([
        {
            data: 'bar',
            meta: expect.objectContaining({ someMeta: 'someMetaValue' }),
        },
        {
            data: 'baz',
            meta: expect.objectContaining({ someMeta: 'otherMetaValue' }),
        },
    ])
    expect(rerender).toBeCalledTimes(1)
})

it('unset per meta=null', async () => {
    const { cache, store, rerender, api } = await setupApi({idbValues: {foo: 'bar', fuu: 'baz'}})

    await api.set({ foo: 'newValue', fuu: 'doesNotMatter' }, {
        fuu: null,
    })

    expect(cache.foo?.obj).toEqual(expect.objectContaining({ data: 'newValue' }))
    expect(cache.fuu?.obj).toEqual(undefined)
    await expect(getMany(['foo', 'fuu'], store)).resolves.toEqual([
        expect.objectContaining({ data: 'newValue' }),
        undefined,
    ])
    expect(rerender).toBeCalledTimes(1)
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
