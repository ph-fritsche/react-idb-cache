import { addListener, dispatch, removeListener } from '../../src/shared'

it('add listeners', () => {
    const listenerA = () => { return }
    const listenerB = () => { return }
    const cache = {}

    addListener(cache, ['foo', 'bar'], 'listenerTestA', listenerA)
    addListener(cache, ['bar'], 'listenerTestB', listenerB)

    expect(cache).toEqual({
        foo: {
            listeners: {
                listenerTestA: listenerA,
            },
        },
        bar: {
            listeners: {
                listenerTestA: listenerA,
                listenerTestB: listenerB,
            },
        },
    })
})

it('remove listeners', () => {
    const listenerA = () => { return }
    const listenerB = () => { return }
    const cache = {
        foo: {
            listeners: {
                listenerTestA: listenerA,
            },
        },
        bar: {
            listeners: {
                listenerTestA: listenerA,
                listenerTestB: listenerB,
            },
        },
    }

    removeListener(cache, 'listenerTestA', ['foo', 'baz'])
    removeListener(cache, 'listenerTestB')

    expect(cache).toEqual({
        bar: {
            listeners: {
                listenerTestA: listenerA,
            },
        },
    })
})

it('dispatch listeners', () => {
    const listenerA = jest.fn()
    const listenerB = jest.fn()
    const cache = {
        foo: {
            listeners: {
                listenerTestA: listenerA,
            },
        },
        bar: {
            listeners: {
                listenerTestA: listenerA,
                listenerTestB: listenerB,
            },
        },
    }

    dispatch(cache, ['foo', 'bar'])

    expect(listenerA).toBeCalledTimes(1)
    expect(listenerB).toBeCalledTimes(1)
})
