import React from 'react'
import { render } from '@testing-library/react'
import { useCached } from '../src'

function setup(props?: Parameters<typeof useCached>[0]) {
    let hook: ReturnType<typeof useCached>
    function TestComponent(p: Parameters<typeof useCached>[0] = {}) {
        hook = useCached(Object.keys(p).length ? p : undefined)
        return null
    }

    render(<TestComponent {...props}/>)

    return { getHook: () => hook }
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
