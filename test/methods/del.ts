import NullDB from '../../src/driver/NullDB'
import { Keys } from '../../src/shared'
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
    const { api, driver, listener } = await setupApi({
        idbValues: { foo: 'bar' },
        listen: ['foo'],
    })

    await api.del('foo')

    expect(await driver.getMany(['foo'])).toEqual([undefined])
    expect(listener).toHaveBeenCalledTimes(1)
})

it('trigger Keys listener when deleting entry', async () => {
    const { api, listener } = await setupApi({
        dbDriverFactory: NullDB,
        cacheValues: {
            'foo': 123,
        },
        listen: [Keys],
    })

    await api.del('bar')

    expect(listener).toBeCalledTimes(0)

    await api.del('foo')

    expect(listener).toBeCalledTimes(1)
})
