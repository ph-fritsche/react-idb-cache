import IndexedDB from '../../src/driver/IndexedDB'
import IndexedKeyvalDB from '../../src/driver/IndexedKeyvalDB'

test.each([
    IndexedDB,
    IndexedKeyvalDB,
])('store and retrieve data', async (driverFactory) => {
    const driver = driverFactory('test', 'teststorage')

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
