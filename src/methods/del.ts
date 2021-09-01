import { DBDriver } from '../driver/abstract'
import { delProperty, dispatch, Keys, reactCache } from '../shared'

export async function del(
    cache: reactCache,
    driver: DBDriver,
    key: string,
): Promise<void> {
    const hasCacheKey = !!cache[key]?.obj

    await driver.del(key)

    if (hasCacheKey) {
        delProperty(cache, [key, 'obj'])

        dispatch(cache, [Keys])
    }

    dispatch(cache, [key])
}
