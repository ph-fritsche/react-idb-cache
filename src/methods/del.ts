import { DBDriver } from '../driver/abstract'
import { delProperty, dispatch, reactCache } from '../shared'

export async function del(
    cache: reactCache,
    driver: DBDriver,
    key: string,
): Promise<void> {
    await driver.del(key)
    delProperty(cache, [key, 'obj'])

    dispatch(cache, [key])
}
