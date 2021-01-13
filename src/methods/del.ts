import { del as idbDel } from 'idb-keyval'
import { reactCache } from '../shared'

export async function del(
    cache: reactCache,
    store: Parameters<typeof idbDel>[1],
    key: string,
): Promise<void> {
    await idbDel(key, store)
    delete cache[key]
}
