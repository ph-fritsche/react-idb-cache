import IndexedDB from '../../src/driver/IndexedDB'

test('use multiple stores', async () => {
    const driverA = IndexedDB('test', 'teststorageA')
    const driverB = IndexedDB('test', 'teststorageB')

    await driverA.setMany([
        ['key1', {data: 'value1', meta: {}}],
    ])
    await driverB.setMany([
        ['key2', {data: 'value2', meta: {}}],
    ])

    await expect(driverA.entries()).resolves.toEqual([
        ['key1', {data: 'value1', meta: {}}],
    ])
    await expect(driverA.entries()).resolves.toEqual([
        ['key1', {data: 'value1', meta: {}}],
    ])
})
