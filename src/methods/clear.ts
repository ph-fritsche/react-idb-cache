import { entries, setMany, clear as idbClear } from 'idb-keyval'
import { delProperty, dispatch, expire, reactCache, verifyEntry } from '../shared'

export async function clear(
    cache: reactCache,
    store: Parameters<typeof idbClear>[0],
    expire?: expire,
): Promise<void> {
    await (expire
        ? entries(store)
            .then(entries => setMany(
                entries
                    .filter(([, obj]) => !verifyEntry({ obj }, expire))
                    .map(([key]) => [key, undefined]),
                store,
            ))
        : idbClear(store)
    )

    const keys: string[] = []
    Object.entries(cache).forEach(([key, entry]) => {
        if (expire) {
            if (!verifyEntry({ obj: entry.obj }, expire)) {
                keys.push(key)
                delProperty(cache, [key, 'obj'])
            }
        } else {
            keys.push(key)
            delProperty(cache, [key, 'obj'])
        }
    })

    dispatch(cache, keys)
}
