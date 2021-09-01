import { clear, createStore } from 'idb-keyval'
import IndexedDB from '../../src/driver/IndexedDB'

const storeParams: Parameters<typeof createStore> = ['test', 'teststorage']

beforeEach(async () => {
    await clear(createStore(...storeParams))
})

test('relay calls to idb-keyval', async () => {
    const driver = IndexedDB(...storeParams)

    await expect(driver.setMany([
        ['foo', { data: 'someValue', meta: {} }],
        ['bar', { data: 'anotherValue', meta: {} }],
    ])).resolves.toBe(undefined)

    await expect(driver.getMany(['bar', 'foo'])).resolves.toEqual([
        { data: 'anotherValue', meta: {} },
        { data: 'someValue', meta: {} },
    ])

    await expect(driver.entries()).resolves.toEqual(expect.arrayContaining([
        ['foo', { data: 'someValue', meta: {} }],
        ['bar', { data: 'anotherValue', meta: {} }],
    ]))

    await expect(driver.del('foo')).resolves.toBe(undefined)

    await expect(driver.getMany(['bar', 'foo'])).resolves.toEqual([
        { data: 'anotherValue', meta: {} },
        undefined,
    ])

    await expect(driver.clear()).resolves.toBe(undefined)

    await expect(driver.entries()).resolves.toEqual([])
})
