import NullDB from '../../src/driver/NullDB'

test('provide DBDriver api without storage', async () => {
    const driver = NullDB()

    await expect(driver.setMany([
        ['foo', {data: 'someValue', meta: {}}],
        ['bar', {data: 'anotherValue', meta: {}}],
    ])).resolves.toBe(undefined)
    await expect(driver.getMany(['foo', 'bar'])).resolves.toEqual([undefined, undefined])
    await expect(driver.entries()).resolves.toEqual([])

    await expect(driver.del('foo')).resolves.toBe(undefined)
    await expect(driver.clear()).resolves.toBe(undefined)
})
