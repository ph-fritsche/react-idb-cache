import { cachedObj } from '../useCached';

interface reactCacheEntry {
    promise?: Promise<cachedObj | undefined>,
    obj?: cachedObj,
}

type reactCache = Record<string, reactCacheEntry>

type expire = number | ((obj: cachedObj) => boolean)
