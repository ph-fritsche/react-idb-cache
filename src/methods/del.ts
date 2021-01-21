import { del as idbDel } from 'idb-keyval'
import { delProperty, dispatch, reactCache } from '../shared'

export async function del(
    cache: reactCache,
    store: Parameters<typeof idbDel>[1],
    key: string,
): Promise<void> {
    await idbDel(key, store)
    delProperty(cache, [key, 'obj'])

    dispatch(cache, [key])
}
