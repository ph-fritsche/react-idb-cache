import { DBDriver } from '../driver/abstract'
import { delProperty, dispatch, expire, reactCache, verifyEntry } from '../shared'

export async function clear(
    cache: reactCache,
    driver: DBDriver,
    expire?: expire,
): Promise<void> {
    await (expire
        ? driver.entries()
            .then(entries => driver.setMany(
                entries
                    .filter(([, obj]) => !verifyEntry({ obj }, expire))
                    .map(([key]) => [key, undefined]),
            ))
        : driver.clear()
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
