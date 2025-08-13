# Context

Reactive state containers emitting events on property changes with automatic resource cleanup.

## Quick Start

```js
import { Context, MetaSubscriber } from './Context';

// Create reactive state - returns proxy for direct access
const user = new Context({ name: 'John', age: 30 });
user.name = 'Jane'; // Direct property access triggers events

// Single property tracking with transformation
const greeting = user.subscriber('name', name => `Hello ${name}`);
console.log(greeting.toString()); // "Hello Jane"

// Multi-property tracking
const profile = new MetaSubscriber({ context: user, key: 'name' }, { context: user, key: 'age' }, (name, age) => ({
	name,
	age,
	canVote: age >= 18,
}));

// Automatic cleanup prevents memory leaks
user.destroy(); // Cleans up all subscriptions and listeners
profile.destroy();
```

## Why This Library?

**Designed for applications that need:**

- **Zero-boilerplate reactivity** - `user.name = 'John'` just works, no setters required
- **Memory safety by default** - Automatic cleanup prevents common memory leaks
- **Complex state relationships** - Cross-context subscriptions and multi-property dependencies
- **Predictable behavior** - Explicit boundaries and clear event flow
- **Graceful error handling** - Parser failures won't crash your app

**Key advantages:**

- **Transparent property access** like MobX but simpler mental model
- **Automatic resource management** that other libraries often leave to you
- **Cross-context composition** for building complex reactive relationships
- **Environment-aware logging** - helpful in development, silent in production
- **Progressive complexity** - start simple with Context, add MetaSubscriber as needed

Perfect for medium-to-large applications where state management complexity and memory leaks become real concerns.

## Core Classes

**Context** - Reactive state container with automatic resource management

- Property changes emit `'set'` (generic) + `'{propertyName}'` (specific) events
- Event listeners and subscriptions auto-cleanup on destroy

**Subscriber** - Reactive value tracking single property via `context.subscriber(key, parser?)`

- Proxy provides transparent access to transformed value
- Integrates with Context cleanup system

**MetaSubscriber** - Reactive value combining multiple properties

- Updates when any tracked property changes
- Supports debouncing and individual property parsers
- Automatic cleanup of all target subscriptions

## Key Patterns

### Multi-Property Dependencies

```js
// ❌ Only tracks firstName - lastName changes missed
const bad = user.subscriber('firstName', first => `${first} ${user.lastName}`);

// ✅ Tracks both properties reactively
const fullName = new MetaSubscriber(
	{ context: user, key: 'firstName' },
	{ context: user, key: 'lastName' },
	(first, last) => `${first} ${last}`,
);
```

### Cross-Context Reactivity

```js
const user = new Context({ name: 'Alice' });
const ui = new Context({
	greeting: user.subscriber('name', name => `Hello ${name}`),
});

user.name = 'Bob'; // ui.greeting automatically updates
ui.destroy(); // Cleans up cross-context subscription
```

### Event Handling

```js
// Property-specific events (auto-cleanup on destroy)
state.addEventListener('status', ({ detail }) => console.log('Status:', detail));

// Manual subscription with parsing
const { unsubscribe } = state.subscribe({
	key: 'items',
	callback: active => console.log(`${active.length} active`),
	parser: items => items.filter(item => item.active),
});

unsubscribe(); // Manual cleanup
// OR
state.destroy(); // Automatic cleanup of all resources
```

### Resource Management

```js
const context = new Context({ data: [] });
const subscriber = context.subscriber('data', data => data.length);
const meta = new MetaSubscriber({ context, key: 'data' }, data => ({ count: data.length, isEmpty: data.length === 0 }));

// Manual cleanup
subscriber.destroy();
meta.destroy();
context.destroy();

// Automatic cleanup with disposables
using context = new Context({ data: [] });
using subscriber = context.subscriber('data');
// All cleaned up automatically when leaving scope
```

## Error Handling

- **Development**: Console warnings with detailed context
- **Production**: Silent recovery, parser errors return `null`
- **Validation**: Always throws for invalid constructor args
- **Cleanup**: Error isolation prevents cleanup failures from affecting other resources

## API Reference

### Context

```js
new Context(initialState: object): Proxy

// Properties
.isDestroyed: boolean

// Properties (via proxy)
.{anyPropertyOfValue} // Transparent access to current value

// Core methods
.subscriber(key: string, parser?: Function): Subscriber
.subscribe({key, callback, parser?}): {unsubscribe, current, id}
.addEventListener(type: string, callback: Function): void
.destroy(): void
```

### Subscriber

```js
context.subscriber(key: string, parser?: Function): Subscriber

// Subscriber methods
.subscribe(callback: Function): {unsubscribe, current}
.destroy(): void
```

### MetaSubscriber

```js
new MetaSubscriber(
  ...targets: {context, key, parser?}[],
  combiner?: Function,
  options?: {debounceMs?: number}
): MetaSubscriber

// Properties
.isDestroyed: boolean

// Methods
.subscribe(callback: Function): {unsubscribe, current}
.destroy(): void
```

**Default combiner**: Returns array of all values

**Debouncing**: Set `debounceMs > 0` to batch rapid updates
