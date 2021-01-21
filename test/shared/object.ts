import { delProperty, setProperty } from '../../src/shared/object'

it('set deep property', () => {
    const o = {}
    setProperty(o, ['a', 'b', 'c'], 'foo')
    expect(o).toEqual({a: {b: {c: 'foo'}}})
})

it('throw exception when trying to set property on non-object', () => {
    const o = {a: {b: []}}
    expect(() => setProperty(o, ['a', 'b', 'c'], 'foo')).toThrow('$obj.a.b')
})

it('del deep property', () => {
    const o = {a: {b0: {c: 'foo'}, b1: {c: 'foo'}}}
    delProperty(o, ['a', 'b0', 'c'])
    expect(o).toEqual({a: {b1: {c: 'foo'}}})
})

it('throw exception when trying to delete property from non-object', () => {
    const o = { a: { b: [] } }
    expect(() => delProperty(o, ['a', 'b', 'c'])).toThrow('$obj.a.b')
})

it('handle non-existing keys', () => {
    const o = { a: { b1: { c: 'foo' } } }
    delProperty(o, ['a', 'b2', 'c'])
    expect(o).toEqual({ a: { b1: { c: 'foo' } } })

    const p = { a: { b: {} } }
    delProperty(p, ['a', 'b', 'c'])
    expect(p).toEqual({})
})
