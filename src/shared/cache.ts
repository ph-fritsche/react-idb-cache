export interface reactCacheEntry<T extends unknown = unknown> {
    promise?: Promise<cachedObj<T> | undefined>,
    obj?: cachedObj<T>,
    listeners?: Record<string, () => void>,
}

export type reactCache = Record<string, reactCacheEntry>

export type expire = number | ((obj: cachedObj) => boolean)

export type cachedObj<T extends unknown = unknown> = {
    data: T,
    meta: {
        date?: Date | string,
        [k: string]: unknown,
    },
}
