import React, { useContext } from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { useCached } from '../src'
import { clear, createStore } from 'idb-keyval'
import { CacheContext } from '../src/context'

async function setup(
    propsArray: Parameters<typeof useCached>[0][] = [undefined],
    renderArray: ((api: ReturnType<typeof useCached>) => void)[] = [],
) {
    const hook: ReturnType<typeof useCached>[] = []
    function TestComponent({
        i = 0,
        p = {},
        r = () => { return },
    }: {
        i?: number,
        p?: Parameters<typeof useCached>[0],
        r?: (api: ReturnType<typeof useCached>) => void,
    } = {}) {
        hook[i] = useCached(Object.keys(p).length ? p : undefined)
        r(hook[i])
        return null
    }

    // clear IndexedDb and default reactCache to get a fresh start
    for (const p of propsArray) {
        const store = createStore(p?.dbName ?? 'Cached', p?.storeName ?? 'keyval')
        await clear(store)
    }
    function ClearComponent() {
        const cache = useContext(CacheContext)
        Object.keys(cache).forEach(k => { delete cache[k] })
        return null
    }
    render(<ClearComponent/>)

    render(<>
        {propsArray.map((p, i) => <TestComponent key={i} i={i} p={p} r={renderArray[i]}/>)}
    </>)

    return { getHook: (i = 0) => hook[i] }
}

it('provide api', async () => {
    const { getHook } = await setup()

    expect(getHook()).toEqual(expect.objectContaining({
        clear: expect.any(Function),
        del: expect.any(Function),
        get: expect.any(Function),
        set: expect.any(Function),
    }))
})

it('provide api with custom store', async () => {
    const { getHook } = await setup([{dbName: 'foo', storeName: 'bar'}])

    expect(getHook()).toEqual(expect.objectContaining({
        clear: expect.any(Function),
        del: expect.any(Function),
        get: expect.any(Function),
        set: expect.any(Function),
    }))
})

it('get and set without context', async () => {
    const { getHook } = await setup([{context: false}, {context: false}])

    await act(async () => {
        getHook(0).set('foo', 'bar')
        await clear()
    })

    expect(getHook(0).get('foo')).toBe('bar')
    expect(getHook(1).get('foo')).toBe(undefined)
})

it('get and set with context', async () => {
    const { getHook } = await setup([{context: true}, {context: true}])

    await act(async () => {
        getHook(0).set('foo', 'bar')
        await clear()
    })

    expect(getHook(0).get('foo')).toBe('bar')
    expect(getHook(1).get('foo')).toBe('bar')
})

it('rerender component on updated cache', async () => {
    let loadingResolve: (() => void) | undefined = undefined
    const render = jest.fn((api: ReturnType<typeof useCached>) => {
        return api.get('foo', async () => new Promise(res => {
            api.set('foo', 'bar')
            loadingResolve = res
        }))
    })
    await setup([undefined], [render])

    expect(render).toReturnTimes(1)
    expect(render).toHaveNthReturnedWith(1, undefined)

    await waitFor(() => expect(loadingResolve).toBeTruthy())
    act(() => {
        loadingResolve && loadingResolve()
    })

    expect(render).toReturnTimes(2)
    expect(render).toHaveNthReturnedWith(2, 'bar')
})