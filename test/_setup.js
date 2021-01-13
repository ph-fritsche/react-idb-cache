import fakeIndexDB from 'fake-indexeddb'

beforeEach(() => {
    global.indexedDB = fakeIndexDB
})
