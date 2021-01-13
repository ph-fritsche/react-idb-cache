import React from 'react'
import { render } from '@testing-library/react'
import { useCached } from '../src'

function setup() {
    let hook: ReturnType<typeof useCached>
    function TestComponent(props: Parameters<typeof useCached>[0]) {
        hook = useCached(props)
        return null
    }

    render(<TestComponent/>)

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
