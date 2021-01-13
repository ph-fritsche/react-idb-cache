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

    expect(api.get(['foo', 'fuu'], loader, expire)).toEqual({ foo: 'bar', fuu: undefined })
    expect(rerender).not.toBeCalled()
    const fooPromise = cache.foo?.promise
    const fuuPromise = cache.fuu?.promise
    expect(fooPromise).toBeInstanceOf(Promise)
    expect(fuuPromise).toBeInstanceOf(Promise)

    await new Promise(r => setTimeout(r, 10))

    expect(expire).toHaveBeenNthCalledWith(1, expect.objectContaining({ data: 'bar', meta: { date: new Date('2001-02-03T04:05:06')}}))
    expect(expire).toHaveBeenNthCalledWith(2, expect.objectContaining({ data: 'baz', meta: { date: new Date('2001-02-03T04:05:06')}}))

    expect(loader).toBeCalledWith(['foo', 'fuu'])
    await expect(fooPromise).resolves.toEqual({ data: 'bar', meta: { date: new Date('2001-02-03T04:05:06') }})
    await expect(fuuPromise).resolves.toEqual({ data: 'BAZ', meta: { date: new Date('2011-12-13T14:15:16') }})
})

it('call loader for expired (per age) entries', async () => {
    const { cache, rerender, api } = await setupApi({cacheValues: { foo: 'bar' }, idbValues: { fuu: 'baz' } })
    const loader = jest.fn(() => Promise.resolve())

    expect(api.get(['foo', 'fuu'], loader, 1)).toEqual({ foo: 'bar', fuu: undefined })
    expect(rerender).not.toBeCalled()
    expect(cache.foo?.promise).toBeInstanceOf(Promise)
    expect(cache.fuu?.promise).toBeInstanceOf(Promise)

    await new Promise(r => setTimeout(r, 10))

    expect(loader).toBeCalledWith(['foo', 'fuu'])
})
