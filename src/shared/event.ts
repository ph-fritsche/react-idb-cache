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
): void {
    (keys ?? Object.keys(cache)).forEach(key => {
        delProperty(cache, [key, 'listeners', id])
    })
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
