import 'fake-indexeddb/auto'
import FDBFactory from 'fake-indexeddb/lib/FDBFactory'
import { resetConnections } from '../src/driver/IndexedDB'

beforeEach(async () => {
    global.indexedDB = new FDBFactory()
    await resetConnections()
})

jest.mock('debug', () => ({
    __esModule: true,
    default: () => {
        const f = jest.fn()
        f.enabled = true
        return f
    },
}))
