import { DBDriver } from '../driver/abstract'
import { delProperty, dispatch, expire, Keys, reactCache, verifyEntry } from '../shared'

export async function clear(
    cache: reactCache,
    driver: DBDriver,
    expire?: expire,
): Promise<void> {
    const updateKeys: Array<keyof reactCache> = []

    if (expire) {
        const dbEntries = await driver.entries()
        await driver.setMany(dbEntries
            .filter(([, obj]) => !verifyEntry({ obj }, expire))
            .map(([key]) => [key, undefined]),
        )
        for (const [key, entry] of Object.entries(cache)) {
            if (entry.obj !== undefined && !verifyEntry(entry, expire)) {
                updateKeys.push(key)
                delProperty(cache, [key, 'obj'])
            }
        }
    } else {
        await driver.clear()

        for (const [key, entry] of Object.entries(cache)) {
            if (entry.obj !== undefined) {
                updateKeys.push(key)
                delProperty(cache, [key, 'obj'])
            }
        }
    }

    if (updateKeys.length) {
        updateKeys.push(Keys)
        dispatch(cache, updateKeys)
    }
}
