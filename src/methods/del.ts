import { del as idbDel } from 'idb-keyval'
import { reactCache } from '../shared'

export function del(
    cache: reactCache,
    store: Parameters<typeof idbDel>[1],
    key: string,
): void {
    delete cache[key]
    idbDel(key, store)
}
