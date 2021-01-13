export interface reactCacheEntry {
    promise?: Promise<cachedObj | undefined>,
    obj?: cachedObj,
}

export type reactCache = Record<string, reactCacheEntry>

export type expire = number | ((obj: cachedObj) => boolean)

export interface cachedObj {
    data: unknown,
    meta: {
        date?: Date | string,
        [k: string]: unknown,
    },
}
