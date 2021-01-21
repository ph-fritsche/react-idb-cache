import { get } from 'idb-keyval'
import { setupApi } from './_'

it('delete entry from cache', async () => {
    const { cache, api, listener } = await setupApi({
        cacheValues: {foo: 'bar'},
        listen: ['foo'],
    })

    await api.del('foo')

    expect(cache.foo?.obj).toBe(undefined)
    expect(listener).toHaveBeenCalledTimes(1)
})

it('delete entry from idb', async () => {
    const { store, api, listener } = await setupApi({
        idbValues: { foo: 'bar' },
        listen: ['foo'],
    })

    await api.del('foo')

    expect(await get('foo', store)).toBe(undefined)
    expect(listener).toHaveBeenCalledTimes(1)
})
