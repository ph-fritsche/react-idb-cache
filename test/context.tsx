import { render } from '@testing-library/react'
import React, { useContext, useEffect } from 'react'
import { CacheContext, CacheProvider } from '../src/context'

it('provide cache context', async () => {
    function TestComponentA() {
        const cache = useContext(CacheContext)
        useEffect(() => {
            cache['foo'] = {}
            cache['foo']['bar'] = {}
            cache['foo']['bar']['baz'] = { obj: { data: 'value', meta: {} } }
        })
        return null
    }

    let valueB = undefined
    function TestComponentB() {
        const cache = useContext(CacheContext)
        useEffect(() => {
            valueB = cache.foo?.bar?.baz?.obj?.data
        })
        return null
    }

    let valueC = undefined
    function TestComponentC() {
        const cache = useContext(CacheContext)
        useEffect(() => {
            valueC = cache.foo?.bar?.baz?.obj?.data
        })
        return null
    }

    render(<>
        <CacheProvider>
            <TestComponentA/>
            <TestComponentB/>
        </CacheProvider>
        <CacheProvider>
            <TestComponentC/>
        </CacheProvider>
    </>)

    expect(valueB).toBe('value')
    expect(valueC).toBe(undefined)
})
