# Context

Context is an observable object. Changes to properties can be subscribed to.

```js
const context = new Context({
	myCustomState: 'aString',
});

console.log(context.myCustomState);
// log: 'aString'

context.addEventListener('myCustomState', ({ detail: value }) => console.log(`new value: ${value}`));

context.myCustomState = 'bString';
// log: 'new value: bString'
```
