# Context

Context is an observable object. Changes to properties can be subscribed to.

```js
const context = new Context({
	myCustomState: 'aString',
	myOtherCustomState: false,
});

console.log(context.myCustomState);
// log: 'aString'
```

Individual properties can be subscribed to:

```js
context.addEventListener('myCustomState', ({ detail: value }) => console.log(`new value: ${value}`));

context.myCustomState = 'bString';
// log: 'new value: bString'
```

Entire objects can be subscribed to:

```js
context.addEventListener('set', ({ detail: { key, value } }) => console.log(`change: ${key}: ${value}`));

context.myOtherCustomState = true;
// log: 'change: myOtherCustomState:true'

context.myCustomState = 'cString';
// log: 'change: myCustomState:cString'
```

## Subscribers

Subscribers are self-updating values that re-evaluate themselves when the chosen key changes.

The primary purpose of subscribers is to link pieces of context together:

```js
const contextTwo = new Context({
	aCoolProperty: 'aString',
	myCoolDerivedString: context.subscriber('myCustomState', string => string.slice(1).toUpperCase()),
	myCoolDerivedBoolean: context.subscriber('myOtherCustomState'),
});

contextTwo.addEventListener('set', ({ detail: { key, value } }) => console.log(`change: ${key}: ${value}`));

context.myOtherCustomState = false;
// log: 'change: myCoolDerivedBoolean:false'

context.myCustomState = 'dString';
// log: 'change: myCoolDerivedString:STRING'
```
