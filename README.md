# react-idb-cache

Use IndexedDB as a cache in React components.

```js
import { useIdbCache } from 'react-idb-cache'

function MyComponent() {
  const { get, set } = useIdbCache()

  // Get value from IndexedDB if it exists - the state will be updated if a value is received
  const value = get('indexKeyForValue')

  // Load a value from an API endpoint if it does not exist in the cache
  const otherValue = get('indexKeyForOtherValue', () => someRequest().then(({theRequiredValue, someOtherValue}) => {
      // set the value in state and IndexedDB
      set('indexKeyForOtherValue', theRequiredValue, {someMetaField: 123})

      // also cache other received values to prevent unnecessary network round trips
      set('indexKeyForSomeOtherValue', someOtherValue, {date: new Date()})
  }))

  // Discard values (e.g. as expired) per callback
  const validatedValue = get('indexKeyForValidatedValue', undefined, ({data, meta}) => meta.someMetaField > 123)

  // Discard values if meta.date is set and older than 5 seconds
  const expiringValue = get('indexKeyForExpiringValue', undefined, 5000)

  // ...
}
```
