import { reactCache, reactCacheEntry } from './cache'
import { delProperty, setProperty } from './object'

export function addListener(
    cache: reactCache,
    keys: (keyof reactCache)[],
    id: string,
    listener: () => void,
): void {
    keys.forEach(key => {
        setProperty(cache, [key, 'listeners', id], listener)
    })
}

export function removeListener(
    cache: reactCache,
    id: string,
    keys?: (keyof reactCache)[],
): (keyof reactCache)[] {
    const removedKeys: (keyof reactCache)[] = []
    const traverseKeys = (keys ?? Object.keys(cache))

    traverseKeys.forEach(key => {
        if (cache[key]?.listeners?.[id]) {
            delProperty(cache, [key, 'listeners', id])
            removedKeys.push(key)
        }
    })

    return removedKeys
}

export function dispatch(
    cache: reactCache,
    keys: (keyof reactCache)[],
): void {
    const listeners: reactCacheEntry['listeners'] = {}

    keys.forEach(key => {
        Object.entries(cache[key]?.listeners ?? {}).forEach(([id, listener]) => {
            listeners[id] = listener
        })
    })

    Object.values(listeners).forEach(listener => listener())
}
