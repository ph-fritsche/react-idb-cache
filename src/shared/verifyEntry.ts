import { cachedObj, expire } from './cache'

export function verifyEntry(entry: {obj?: cachedObj} | undefined, expire: expire | undefined): boolean {
    if (!entry?.obj) {
        return false
    }

    if (typeof (expire) === 'function') {
        return !expire(entry.obj)
    } else if (typeof (expire) === 'number' && entry.obj.meta.date) {
        const d = typeof (entry.obj.meta.date) === 'string' ? new Date(entry.obj.meta.date) : entry.obj.meta.date
        if (d.getTime() < (new Date()).getTime() - expire) {
            return false
        }
    }

    return true
}
