import { render } from '@testing-library/react'
import React, { useContext, useEffect } from 'react'
import { CacheContext, CacheProvider, configureGlobalCache, globalContext } from '../src/context'
import NullDB from '../src/driver/NullDB'

let defaultContext: typeof globalContext
beforeAll(() => {
    defaultContext = {...globalContext}
})
afterEach(() => {
    globalContext.cache = {}
    globalContext.dbDriverFactory = defaultContext.dbDriverFactory
})

it('provide cache context', async () => {
    function TestComponentA() {
        const {cache} = useContext(CacheContext)
        useEffect(() => {
            cache['foo'] = {}
            cache['foo']['bar'] = {}
            cache['foo']['bar']['baz'] = { obj: { data: 'value', meta: {} } }
        })
        return null
    }

    let valueB = undefined
    function TestComponentB() {
        const {cache} = useContext(CacheContext)
        useEffect(() => {
            valueB = cache.foo?.bar?.baz?.obj?.data
        })
        return null
    }

    let valueC = undefined
    function TestComponentC() {
        const {cache} = useContext(CacheContext)
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

it('provide dbDriverFactory', () => {
    let contextFactory = undefined
    function TestComponent() {
        const {dbDriverFactory} = useContext(CacheContext)
        contextFactory = dbDriverFactory
        return null
    }

    render(<>
        <CacheProvider dbDriverFactory={NullDB}>
            <TestComponent/>
        </CacheProvider>
    </>)

    expect(contextFactory).toBe(NullDB)
})

it('configure global dbDriverFactory', () => {
    let contextFactory = undefined
    function TestComponent() {
        const { dbDriverFactory } = useContext(CacheContext)
        contextFactory = dbDriverFactory
        return null
    }

    configureGlobalCache({dbDriverFactory: NullDB})

    render(<TestComponent />)

    expect(contextFactory).toBe(NullDB)
})
