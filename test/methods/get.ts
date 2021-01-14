import { cachedObj } from '../../src/shared'
import { setupApi } from './_'

it('get entry from cache', async () => {
    const { rerender, api } = await setupApi({ cacheValues: { foo: 'bar' } })

    expect(api.get('foo')).toBe('bar')
    expect(rerender).not.toBeCalled()
})

it('get multiple entries from cache', async () => {
    const { rerender, api } = await setupApi({ cacheValues: { foo: 'bar', fuu: 'baz' } })

    expect(api.get(['foo', 'fuu'])).toEqual({foo: 'bar', fuu: 'baz'})
    expect(rerender).not.toBeCalled()
})

it('get entry from idb', async () => {
    const { cache, rerender, api } = await setupApi({ idbValues: { foo: 'bar' } })

    expect(api.get('foo')).toBe(undefined)
    expect(rerender).not.toBeCalled()
    expect(cache.foo?.promise).toBeInstanceOf(Promise)

    await expect(cache.foo?.promise).resolves.toEqual(expect.objectContaining({data: 'bar'}))
    expect(api.get('foo')).toBe('bar')
    expect(rerender).toBeCalledTimes(1)
})

it('get mutliple entries from idb', async () => {
    const { cache, rerender, api } = await setupApi({ idbValues: { foo: 'bar', fuu: 'baz' } })

    expect(api.get(['foo', 'fuu'])).toEqual({foo: undefined, fuu: undefined})
    expect(rerender).not.toBeCalled()
    expect(cache.foo?.promise).toBeInstanceOf(Promise)
    expect(cache.fuu?.promise).toBeInstanceOf(Promise)

    await Promise.all([
        expect(cache.foo?.promise).resolves.toEqual(expect.objectContaining({ data: 'bar' })),
        expect(cache.fuu?.promise).resolves.toEqual(expect.objectContaining({ data: 'baz' })),
    ])
    expect(rerender).toBeCalled()
    expect(api.get(['foo', 'fuu'])).toEqual({foo: 'bar', fuu: 'baz'})
    expect(rerender).toBeCalledTimes(1)
})

it('get entries from cache and idb', async () => {
    const { cache, rerender, api } = await setupApi({ cacheValues: {foo: 'bar'}, idbValues: { fuu: 'baz' } })

    expect(api.get(['foo', 'fuu'])).toEqual({ foo: 'bar', fuu: undefined })
    expect(rerender).not.toBeCalled()
    expect(cache.foo?.promise).toBe(undefined)
    expect(cache.fuu?.promise).toBeInstanceOf(Promise)

    await expect(cache.fuu?.promise).resolves.toEqual(expect.objectContaining({ data: 'baz' }))
    expect(api.get(['foo', 'fuu'])).toEqual({ foo: 'bar', fuu: 'baz' })
    expect(rerender).toBeCalledTimes(1)
})

it('call loader for missing entries', async () => {
    const { cache, rerender, api } = await setupApi({ cacheValues: { foo: 'bar' }, idbValues: { fuu: 'baz' } })
    const loader = jest.fn(() => Promise.resolve())

    expect(api.get(['foo', 'fuu', 'faa'], loader)).toEqual({ foo: 'bar', fuu: undefined, faa: undefined })
    expect(rerender).not.toBeCalled()
    expect(cache.foo?.promise).toBe(undefined)
    expect(cache.fuu?.promise).toBeInstanceOf(Promise)
    expect(cache.faa?.promise).toBeInstanceOf(Promise)
    await expect(cache.fuu?.promise).resolves.toEqual(expect.objectContaining({ data: 'baz' }))

    expect(loader).toBeCalledWith(['faa'])
})

it('call loader for expired (per callback) entries', async () => {
    const { cache, rerender, api } = await setupApi({cacheValues: { foo: 'bar' }, idbValues: { fuu: 'baz' } })
    const loader = jest.fn(() => {
        cache.fuu.obj = { data: 'BAZ', meta: { date: new Date('2011-12-13T14:15:16') }}
        return Promise.resolve()
    })
    const expire = jest.fn(() => true)

    expect(api.get(['foo', 'fuu', 'faa'], loader, expire)).toEqual({ foo: 'bar', fuu: undefined, faa: undefined})
    expect(rerender).not.toBeCalled()
    const fooPromise = cache.foo?.promise
    const fuuPromise = cache.fuu?.promise
    const faaPromise = cache.faa?.promise
    expect(fooPromise).toBeInstanceOf(Promise)
    expect(fuuPromise).toBeInstanceOf(Promise)
    expect(faaPromise).toBeInstanceOf(Promise)

    await new Promise(r => setTimeout(r, 10))

    expect(expire).toHaveBeenNthCalledWith(1, expect.objectContaining({ data: 'bar', meta: { date: new Date('2001-02-03T04:05:06')}}))
    expect(expire).toHaveBeenNthCalledWith(2, expect.objectContaining({ data: 'baz', meta: { date: new Date('2001-02-03T04:05:06')}}))
    expect(expire).toBeCalledTimes(2)

    expect(loader).toBeCalledWith(['foo', 'fuu', 'faa'])
    await expect(fooPromise).resolves.toEqual({ data: 'bar', meta: { date: new Date('2001-02-03T04:05:06') }})
    await expect(fuuPromise).resolves.toEqual({ data: 'BAZ', meta: { date: new Date('2011-12-13T14:15:16') }})
    await expect(faaPromise).resolves.toEqual(undefined)
})

it('call loader for expired (per age) entries', async () => {
    const { cache, rerender, api } = await setupApi({
        cacheObjects: {
            faa: { data: 'a', meta: { date: new Date() }},
            fee: { data: 'b', meta: { date: (new Date()).toString() }},
            fii: { data: 'c', meta: { date: undefined }},
        },
        cacheValues: { foo: 'bar'},
        idbValues: { fuu: 'baz' },
    })
    const loader = jest.fn(() => Promise.resolve())

    expect(api.get(['faa', 'fee', 'fii', 'foo', 'fuu'], loader, 10000)).toEqual({ faa: 'a', fee: 'b', fii: 'c', foo: 'bar', fuu: undefined })
    expect(rerender).not.toBeCalled()
    expect(cache.faa?.promise).toBe(undefined)
    expect(cache.fee?.promise).toBe(undefined)
    expect(cache.fii?.promise).toBe(undefined)
    expect(cache.foo?.promise).toBeInstanceOf(Promise)
    expect(cache.fuu?.promise).toBeInstanceOf(Promise)

    await new Promise(r => setTimeout(r, 10))

    expect(loader).toBeCalledWith(['foo', 'fuu'])
})

it('skip fetching object when a promise is pending', async () => {
    const { api } = await setupApi()
    let resolveLoader: () => void = () => { return }
    const loader = jest.fn(() => new Promise<void>(r => { resolveLoader = r}))

    expect(api.get('foo', loader)).toEqual(undefined)
    await new Promise(r => setTimeout(r, 1))
    expect(loader).toBeCalledTimes(1)

    expect(api.get('foo', loader)).toEqual(undefined)
    await new Promise(r => setTimeout(r, 1))
    expect(loader).toBeCalledTimes(1)

    resolveLoader()
    await new Promise(r => setTimeout(r, 1))

    expect(api.get('foo', loader)).toEqual(undefined)
    await new Promise(r => setTimeout(r, 1))
    expect(loader).toBeCalledTimes(2)
})
