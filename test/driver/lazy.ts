import { cachedObj } from '../../src'
import { DBDriver } from '../../src/driver/abstract'
import { lazyDBDriver } from '../../src/driver/lazy'


test('load driver and relay calls', async () => {
    const driver: DBDriver = {
        clear: jest.fn(),
        del: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entries: jest.fn(async (): Promise<[string, cachedObj<any>][]> => [
            ['foo', { data: 'bar', meta: {} }],
        ]),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getMany: jest.fn(async (): Promise<any[]> => [
            { data: 123, meta: {} },
        ]),
        setMany: jest.fn(),
    }
    const loader = jest.fn(async () => (() => ({...driver})))
    const lazyFactory = lazyDBDriver(loader)
    const LazyDB = lazyFactory('test', 'null')

    expect(loader).not.toBeCalled()

    await expect(LazyDB.clear()).resolves.toBe(undefined)
    expect(driver.clear).toBeCalledTimes(1)

    expect(loader).toBeCalledTimes(1)

    await expect(LazyDB.del('foo')).resolves.toBe(undefined)
    expect(driver.del).toBeCalledTimes(1)
    expect(driver.del).toBeCalledWith('foo')

    await expect(LazyDB.entries()).resolves.toEqual([
        ['foo', { data: 'bar', meta: {} }],
    ])
    expect(driver.entries).toBeCalledTimes(1)

    await expect(LazyDB.getMany(['whatever'])).resolves.toEqual([
        { data: 123, meta: {} },
    ])
    expect(driver.getMany).toBeCalledTimes(1)
    expect(driver.getMany).toBeCalledWith(['whatever'])

    await expect(LazyDB.setMany([['foo', {data: 456, meta: {}}]])).resolves.toBe(undefined)
    expect(driver.setMany).toBeCalledTimes(1)
    expect(driver.setMany).toBeCalledWith([['foo', { data: 456, meta: {} }]])

    expect(loader).toBeCalledTimes(1)
})
