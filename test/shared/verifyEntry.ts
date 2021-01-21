import { verifyEntry } from '../../src/shared'

it('return false for non-existent objects', () => {
    const expire = jest.fn()

    expect(verifyEntry(undefined, expire)).toBe(false)
    expect(verifyEntry({obj: undefined}, expire)).toBe(false)

    expect(expire).not.toBeCalled()
})

it('return true for objects if no expire is undefined', () => {
    expect(verifyEntry({obj: {data: undefined, meta: {}}}, undefined)).toBe(true)
})

it('verify object per expire callback', () => {
    const entry = {obj: {data: undefined, meta: {}}}
    const expire = jest.fn()

    expire.mockReturnValueOnce(true)
    expect(verifyEntry(entry, expire)).toBe(false)
    expect(expire).toBeCalledTimes(1)
    expect(expire).toBeCalledWith(entry.obj)

    expire.mockReset()

    expire.mockReturnValueOnce(false)
    expect(verifyEntry(entry, expire)).toBe(true)
    expect(expire).toBeCalledTimes(1)
    expect(expire).toBeCalledWith(entry.obj)
})

it('verify object per expire timeout', () => {

    expect(verifyEntry({ obj: { data: undefined, meta: {} } }, 5000)).toBe(true)
    expect(verifyEntry({ obj: { data: undefined, meta: { date: new Date() } } }, 5000)).toBe(true)
    expect(verifyEntry({ obj: { data: undefined, meta: { date: String(new Date()) } } }, 5000)).toBe(true)

    const oldDate = new Date()
    oldDate.setTime(oldDate.getTime() - 10000)

    expect(verifyEntry({ obj: { data: undefined, meta: { date: oldDate } } }, 5000)).toBe(false)
    expect(verifyEntry({ obj: { data: undefined, meta: { date: String(oldDate) } } }, 5000)).toBe(false)
})
