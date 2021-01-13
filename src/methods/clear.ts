import { entries, setMany, clear as idbClear } from 'idb-keyval'
import { expire, reactCache, verifyEntry } from '../shared'

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

    return Object.entries(cache).forEach(([key, entry]) => {
        if (entry.promise) {
            delete entry.obj
        } else {
            delete cache[key]
        }
    })
}
