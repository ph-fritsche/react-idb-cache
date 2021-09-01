import { Keys } from '../../src/shared'
import { setupApi } from './_'

it('get entries from idb', async () => {
    const { api, cache, rerender } = await setupApi({
        cacheEntries: {
            'obsolete': {obj: {data: 'oldEntry', meta: {}}},
            'dummyWithoutObj': {listeners: {dummy: () => void undefined}},
        },
        cacheValues: {
            'foo': 123,
        }, idbValues: {
            'bar': 456,
            'baz': 789,
        },
    })

    expect(api.entries()).toEqual([
        ['obsolete', 'oldEntry'],
        ['foo', 123],
    ])
    const promise = cache[Keys]?.promise
    expect(promise).toBeInstanceOf(Promise)
    expect(api.entries()).toEqual([
        ['obsolete', 'oldEntry'],
        ['foo', 123],
    ])
    expect(cache[Keys]?.promise).toBe(promise)

    await expect(cache[Keys]?.promise).resolves.toEqual([
        ['foo', 123],
        ['bar', 456],
        ['baz', 789],
    ])

    expect(rerender).toBeCalled()
    expect(api.entries()).toEqual([
        ['foo', 123],
        ['bar', 456],
        ['baz', 789],
    ])
    expect(cache[Keys]?.promise).toBe(undefined)
})
