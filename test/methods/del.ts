import { get } from 'idb-keyval'
import { setupApi } from './_'

it('delete entry from cache', async () => {
    const { cache, api } = await setupApi({cacheValues: {foo: 'bar'}})

    await api.del('foo')

    expect(cache.foo).toBe(undefined)
})

it('delete entry from idb', async () => {
    const { store, api } = await setupApi({idbValues: { foo: 'bar' }})

    await api.del('foo')

    expect(await get('foo', store)).toBe(undefined)
})
