import React from 'react'
import { act, render } from '@testing-library/react'
import { useCached } from '../src'
import { clear } from 'idb-keyval'

function setup(...propsArray: Parameters<typeof useCached>[0][]) {
    const hook: ReturnType<typeof useCached>[] = []
    function TestComponent({i = 0, p = {}}: {i?: number, p?: Parameters<typeof useCached>[0]} = {}) {
        hook[i] = useCached(Object.keys(p).length ? p : undefined)
        return null
    }

    render(<>
        {(propsArray.length ? propsArray : [undefined]).map((p, i) => <TestComponent key={i} i={i} p={p} />)}
    </>)

    return { getHook: (i = 0) => hook[i] }
}

it('provide api', () => {
    const { getHook } = setup()

    expect(getHook()).toEqual(expect.objectContaining({
        clear: expect.any(Function),
        del: expect.any(Function),
        get: expect.any(Function),
        set: expect.any(Function),
    }))
})

it('provide api with custom store', () => {
    const { getHook } = setup({dbName: 'foo', storeName: 'bar'})

    expect(getHook()).toEqual(expect.objectContaining({
        clear: expect.any(Function),
        del: expect.any(Function),
        get: expect.any(Function),
        set: expect.any(Function),
    }))
})

it('get and set without context', async () => {
    const { getHook } = setup({context: false}, {context: false})

    await act(async () => {
        getHook(0).set('foo', 'bar')
        await clear()
    })

    expect(getHook(0).get('foo')).toBe('bar')
    expect(getHook(1).get('foo')).toBe(undefined)
})

it('get and set with context', async () => {
    const { getHook } = setup({context: true}, {context: true})

    await act(async () => {
        getHook(0).set('foo', 'bar')
        await clear()
    })

    expect(getHook(0).get('foo')).toBe('bar')
    expect(getHook(1).get('foo')).toBe('bar')
})
