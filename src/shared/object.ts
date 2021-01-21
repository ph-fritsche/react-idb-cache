export function setProperty(obj: Record<string, unknown>, keys: string[], value: unknown): void {
    for(
        let o = obj, i = 0;
        i < keys.length;
        o = o[keys[i]] as Record<string, unknown>, i++
    ) {
        if (o !== undefined && !(o instanceof Object) || Array.isArray(o)) {
            throw `Unexpected type at $obj.${keys.join('.')}`
        }
        if (i < keys.length -1) {
            o[keys[i]] = o[keys[i]] ?? {}
        } else {
            o[keys[i]] = value
        }
    }
}

export function delProperty(obj: Record<string, unknown>, keys: string[]): void {
    const objects: Record<string, unknown>[] = []
    let o, i
    for(
        o = obj, i = 0;
        i < keys.length;
        o = o[keys[i]] as Record<string, unknown>, i++
    ) {
        if (o !== undefined && !(o instanceof Object) || Array.isArray(o)) {
            throw `Unexpected type at $obj.${keys.join('.')}`
        }
        objects.push(o)
        if (o[keys[i]] === undefined) {
            break
        }
    }
    for(
        i = objects.length - 1;
        i >= 0;
        i--
    ) {
        if ((i === keys.length - 1) || objects[i+1] !== undefined && Object.keys(objects[i+1]).length === 0) {
            delete objects[i][keys[i]]
        } else {
            break
        }
    }
}
