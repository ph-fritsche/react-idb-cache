import fakeIndexDB from 'fake-indexeddb'

beforeEach(() => {
    global.indexedDB = fakeIndexDB
})

jest.mock('debug', () => ({
    __esModule: true,
    default: () => {
        const f = jest.fn()
        f.enabled = true
        return f
    },
}))
