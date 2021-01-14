# react-idb-cache

This library helps on one of the trickier parts of writing React components:
How to render on ansynchronously fetched data and cache such data effectively.

## Install

```
$ yarn add react-idb-cache
```

## Usage

```js
import { useCached } from 'react-idb-cache'

function MyComponent() {
  const { get, set } = useCached()

  // Get value from IndexedDB if it exists - the state will be updated if a value is received
  const value = get('indexKeyForValue')

  // Load a value from an API endpoint if it does not exist in the cache or IndexedDB
  const otherValue = get('indexKeyForOtherValue', () => someRequest().then(({theRequiredValue, someOtherValue}) => {
      // set the value in state and IndexedDB
      set('indexKeyForOtherValue', theRequiredValue, {someMetaField: 123})
  }))

  // The component can render without blocking anything.
  // It will be updated once values are available.
  return <div>
    <div>{value}</div>
    <div>{otherValue}</div>
  </div>
}
```

### Setup

```js
  const api = useCached({dbName: 'my-database', storeName: 'my-store'})
```
Per default the hook uses a store `keyval` in database `Cached`.

### Get

#### Get a single value

```js
  const { get } = useCached()
  get('indexKeyForValue')
```
#### Get multiple values

```js
  const { get } = useCached()
  get(['keyOne', 'keyTwo'])

  // returns a record of key-value pairs
  {
    keyOne: 'foo',
    keyTwo: 'bar',
  }
```

#### Load data from the backend

```js
  const { get } = useCached()
  get(['keyOne', 'keyTwo'], myLoader)

  // if the cache/idb has a value for some of the keys, they are returned
  {
    keyOne: 'foo',
    keyTwo: undefined,
  }
```

The `loader` is called - for multiple key requests with an array of missing keys - and should return a `Promise` that should resolve once the transaction is done.

#### Reload outdated entries

##### Callback

You can discard entries from cache/idb per `expire` callback.
If a `loader` is present, it will be called with the missing keys and those keys for which `expire` returned `true`.

```js
  const { get } = useCached()
  get('someKey', myLoader, ({data, meta}) => meta.someMetaField > 123)
```

##### Age

You can discard entries from cache/idb that are older than `expire` milliseconds.
If a `loader` is present, it will be called with the missing keys and those keys for which `expire` returned `true`.

```js
  const { get } = useCached()
  get('someKey', myLoader, 5000) // discard cached entry if meta.date is older that 5 seconds
}
```

### Set

#### Set a single value

```js
  const { set } = useCached()
  set('someKey', 'someValue')
```

The value can be anything that can be stored into IndexedDB.

You can also store some meta data for the entry.

```js
  const { set } = useCached()
  set('someKey', 'someValue', {someMetaKey: new Date()})
```

#### Set multiple values

```js
  const { set } = useCached()
  set({
    keyOne: 'someValue',
    keyTwo: 'otherValue',
  }, {
    keyOne: {
      someMetaKey: 'metaValue',
    },
  })
```

#### Unset values

You can also unset values in bulk action.
```js
  const { set } = useCached()
  set({
    keyOne: 'someValue',
    keyTwo: 'whatever',
  }, {
    keyTwo: null, // this will remove the entry for 'keyTwo'
  })
```

### Delete

```js
  const { del } = useCached()
  del('someKey')
```

### Clear

#### Whole cache and idb-store
```js
  const { clear } = useCached()
  clear()
```

#### Filter entries per callback
Clears the cache and also deletes some data from IndexedDB.
```js
  const { clear } = useCached()
  clear(({data, meta}) => meta.someMetaField > 2) // this will remove all entries with meta.someMetaField > 2
```
