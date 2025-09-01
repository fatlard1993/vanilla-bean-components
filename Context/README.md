# Context

Observable state containers with proxy-based reactivity and subscription system for building reactive web applications.

## Key Features

- **Proxy-based reactivity** - Direct property access (`state.count++`) automatically triggers updates
- **Subscription system** - Transform and react to property changes with parsers
- **Cross-context composition** - Build complex reactive relationships across multiple state objects
- **Automatic memory management** - Event listeners and subscriptions cleaned up on destroy
- **Multi-property tracking** - React to changes across multiple properties simultaneously
- **Environment-aware logging** - Helpful debugging in development, silent in production
- **Graceful error handling** - Parser failures don't crash applications

## Quick Start

### Basic Reactive State

Create reactive state objects with automatic change detection:

```js
import { Context } from 'vanilla-bean-components/Context';

// Create reactive state container
const user = new Context({
	name: 'Alice',
	age: 25,
	email: 'alice@example.com',
});

// Direct property access triggers reactivity
user.name = 'Bob'; // Emits 'name' and 'set' events
user.age++; // Emits 'age' and 'set' events
```

### Property Subscriptions with Transformation

React to property changes with optional data transformation:

```js
// Transform property values
const greeting = user.subscriber('name', name => `Hello, ${name}!`);
console.log(greeting.toString()); // "Hello, Bob!"

// Access current value
console.log(greeting.current); // "Hello, Bob!"

// Subscribe to changes
greeting.subscribe(message => {
	console.log('Greeting updated:', message);
});

user.name = 'Charlie'; // Triggers subscription callback
```

### Multi-Property Dependencies

Track multiple properties simultaneously with MetaSubscriber:

```js
import { MetaSubscriber } from 'vanilla-bean-components/Context';

const profile = new MetaSubscriber({ context: user, key: 'name' }, { context: user, key: 'age' }, (name, age) => ({
	displayName: name,
	canVote: age >= 18,
	category: age < 18 ? 'minor' : age < 65 ? 'adult' : 'senior',
}));

profile.subscribe(data => {
	console.log('Profile:', data.displayName, 'Category:', data.category);
});
```

### Automatic Cleanup

Context provides comprehensive memory management:

```js
const state = new Context({ count: 0 });
const counter = state.subscriber('count', n => `Count: ${n}`);

// Manual cleanup
counter.destroy();
state.destroy();

// Or use disposables for automatic cleanup
using state = new Context({ count: 0 });
using counter = state.subscriber('count');
// Automatically cleaned up when leaving scope
```

## Core Concepts

### Proxy-Based Reactivity

Context uses native JavaScript Proxy to intercept property access:

```js
const state = new Context({ items: [], loading: false });

// These operations emit events automatically
state.items.push(newItem); // Triggers 'items' event
state.loading = true; // Triggers 'loading' event
state.newProperty = 'value'; // Triggers 'newProperty' event
```

**Event types emitted:**

- `'set'` - Generic change event for any property
- `'{propertyName}'` - Specific event for the changed property

### Subscription System

Transform and react to property changes with subscriber functions:

```js
// Simple value access
const value = state.subscriber('count');
console.log(value.current); // Direct access to current value

// With transformation
const formatted = state.subscriber('count', count => {
	return count === 0 ? 'Empty' : count === 1 ? '1 item' : `${count} items`;
});

// With validation and fallback
const safeEmail = state.subscriber('email', email => {
	const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	return isValid ? email : 'invalid@example.com';
});
```

### Cross-Context Relationships

Build reactive relationships between different state objects:

```js
const user = new Context({ name: 'Alice' });
const ui = new Context({ theme: 'light' });

// UI state depends on user data
const title = new MetaSubscriber(
	{ context: user, key: 'name' },
	{ context: ui, key: 'theme' },
	(name, theme) => `Welcome ${name} (${theme} mode)`,
);

// Changes in either context trigger updates
user.name = 'Bob'; // Updates title
ui.theme = 'dark'; // Updates title
```

### Memory Management

Context automatically manages subscriptions and event listeners:

```js
const state = new Context({ data: [] });

// These create internal subscriptions
const subscriber1 = state.subscriber('data');
const subscriber2 = state.subscriber('data', data => data.length);
state.addEventListener('data', handler);

// Single call cleans up everything
state.destroy();
// - Removes all event listeners
// - Destroys all subscribers
// - Prevents further property changes
```

## API Reference

### Context Class

#### Constructor

```js
new Context(initialState);
```

**Parameters:**

- `initialState` (Object) - Initial state properties

**Returns:** Proxy object with reactive property access

#### Properties

```js
state.isDestroyed  // boolean - Cleanup status
state.{property}   // any - Direct access to state properties
```

#### Core Methods

```js
// Create property subscriber
state.subscriber(key, parser?)
// Parameters:
//   key (string) - Property name to track
//   parser (Function, optional) - Transform function (value) => transformed

// Manual subscription
state.subscribe({ key, callback, parser? })
// Parameters:
//   key (string) - Property name
//   callback (Function) - Change handler (value) => void
//   parser (Function, optional) - Transform function
// Returns: { unsubscribe, current, id }

// Event listener registration
state.addEventListener(eventType, callback)
// Parameters:
//   eventType (string) - 'set' or specific property name
//   callback (Function) - Event handler

// Resource cleanup
state.destroy()
// Cleans up all subscriptions, listeners, and subscribers
```

### Subscriber Class

Created via `context.subscriber(key, parser?)`:

```js
// Properties
subscriber.current; // any - Current transformed value
subscriber.isDestroyed; // boolean - Cleanup status

// Methods
subscriber.subscribe(callback);
// Parameters:
//   callback (Function) - Change handler (transformedValue) => void
// Returns: { unsubscribe, current }

subscriber.destroy();
// Cleans up subscription and removes from parent context

subscriber.toString();
// Returns string representation of current value

// Proxy behavior
String(subscriber); // Calls toString()
subscriber + ''; // Converts to string
```

### MetaSubscriber Class

#### Constructor

```js
new MetaSubscriber(...targets, combiner?, options?)
```

**Parameters:**

- `targets` (...Object) - Property targets: `{ context, key, parser? }`
- `combiner` (Function, optional) - Combine function (...values) => result
- `options` (Object, optional) - Configuration options
  - `debounceMs` (number) - Debounce delay in milliseconds

**Default combiner:** Returns array of all values

#### Methods

```js
// Properties
meta.current; // any - Current combined value
meta.isDestroyed; // boolean - Cleanup status

// Methods
meta.subscribe(callback);
// Parameters:
//   callback (Function) - Change handler (combinedValue) => void
// Returns: { unsubscribe, current }

meta.destroy();
// Cleans up all target subscriptions
```

## Advanced Usage

### Debounced Multi-Property Updates

Handle rapid changes with debouncing:

```js
const user = new Context({ firstName: '', lastName: '' });

const debouncedFullName = new MetaSubscriber(
	{ context: user, key: 'firstName' },
	{ context: user, key: 'lastName' },
	(first, last) => `${first} ${last}`.trim(),
	{ debounceMs: 300 }, // Wait 300ms after last change
);

// Rapid changes are batched
user.firstName = 'J';
user.firstName = 'Jo';
user.firstName = 'John';
user.lastName = 'Doe';
// Callback fires once after 300ms with "John Doe"
```

### Individual Property Parsers

Transform values before combining:

```js
const userStats = new MetaSubscriber(
	{
		context: user,
		key: 'score',
		parser: score => Math.max(0, score), // Ensure non-negative
	},
	{
		context: user,
		key: 'level',
		parser: level => Math.min(100, Math.max(1, level)), // Clamp 1-100
	},
	(score, level) => ({
		score,
		level,
		nextLevelPoints: level * 1000 - score,
		progress: score / (level * 1000),
	}),
);
```

### Complex State Relationships

Build hierarchical reactive state:

```js
const app = new Context({
	user: { id: null, name: '', role: 'guest' },
	ui: { theme: 'light', sidebarOpen: false },
});

const permissions = new MetaSubscriber({ context: app, key: 'user' }, user => ({
	canEdit: user.role === 'admin' || user.role === 'editor',
	canDelete: user.role === 'admin',
	canView: user.role !== 'guest',
}));

const header = new MetaSubscriber(
	{ context: app, key: 'user' },
	{ context: app, key: 'ui' },
	permissions,
	(user, ui, perms) => ({
		title: user.name ? `Welcome ${user.name}` : 'Please log in',
		showMenu: perms.canView,
		theme: ui.theme,
		actions: {
			edit: perms.canEdit,
			delete: perms.canDelete,
		},
	}),
);
```

### Event-Driven Architecture

Use Context events for loose coupling:

```js
const eventBus = new Context({});

// Publisher
class UserService {
	async updateUser(id, data) {
		const result = await api.updateUser(id, data);
		eventBus.userUpdated = { id, data: result, timestamp: Date.now() };
		return result;
	}
}

// Subscribers
class UserList {
	init() {
		eventBus.addEventListener('userUpdated', ({ detail }) => {
			this.refreshUser(detail.id);
		});
	}
}

class NotificationService {
	init() {
		eventBus.addEventListener('userUpdated', ({ detail }) => {
			this.showNotification(`User ${detail.data.name} updated`);
		});
	}
}
```

## Real-World Examples

### Shopping Cart with Live Updates

```js
import { Context, MetaSubscriber } from 'vanilla-bean-components/Context';

// Cart state
const cart = new Context({
	items: [],
	discountCode: '',
	shippingMethod: 'standard',
});

// Reactive calculations
const cartSummary = new MetaSubscriber(
	{ context: cart, key: 'items' },
	{ context: cart, key: 'discountCode' },
	{ context: cart, key: 'shippingMethod' },
	(items, discountCode, shipping) => {
		const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		const discount = discountCode === 'SAVE10' ? subtotal * 0.1 : 0;
		const shippingCost = shipping === 'express' ? 15 : 5;
		const total = subtotal - discount + shippingCost;

		return {
			itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
			subtotal,
			discount,
			shippingCost,
			total,
		};
	},
);

// Cart operations
const cartActions = {
	addItem(product, quantity = 1) {
		const existing = cart.items.find(item => item.id === product.id);
		if (existing) {
			existing.quantity += quantity;
			cart.items = [...cart.items]; // Trigger change
		} else {
			cart.items.push({ ...product, quantity });
		}
	},

	removeItem(productId) {
		cart.items = cart.items.filter(item => item.id !== productId);
	},

	applyDiscount(code) {
		cart.discountCode = code;
	},
};

// UI integration
cartSummary.subscribe(summary => {
	document.querySelector('.cart-total').textContent = `$${summary.total.toFixed(2)}`;
	document.querySelector('.item-count').textContent = summary.itemCount;
});
```

### Form Validation System

```js
const form = new Context({
	email: '',
	password: '',
	confirmPassword: '',
	terms: false,
});

// Individual field validation
const emailValid = form.subscriber('email', email => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
});

const passwordValid = form.subscriber('password', password => {
	return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
});

// Cross-field validation
const passwordsMatch = new MetaSubscriber(
	{ context: form, key: 'password' },
	{ context: form, key: 'confirmPassword' },
	(password, confirm) => password === confirm && password.length > 0,
);

// Form validity
const formValid = new MetaSubscriber(
	emailValid,
	passwordValid,
	passwordsMatch,
	{ context: form, key: 'terms' },
	(emailOk, passwordOk, passwordsOk, termsOk) => {
		return emailOk && passwordOk && passwordsOk && termsOk;
	},
);

// UI updates
formValid.subscribe(isValid => {
	document.querySelector('#submit-btn').disabled = !isValid;
});

emailValid.subscribe(isValid => {
	document.querySelector('#email').classList.toggle('error', !isValid);
});
```

### Real-Time Dashboard

```js
const dashboard = new Context({
	users: { active: 0, total: 0 },
	sales: { today: 0, thisMonth: 0 },
	system: { cpu: 0, memory: 0, uptime: 0 },
});

// Derived metrics
const healthStatus = new MetaSubscriber({ context: dashboard, key: 'system' }, system => {
	const cpuStatus = system.cpu < 80 ? 'good' : system.cpu < 95 ? 'warning' : 'critical';
	const memoryStatus = system.memory < 80 ? 'good' : system.memory < 95 ? 'warning' : 'critical';

	return {
		overall:
			cpuStatus === 'critical' || memoryStatus === 'critical'
				? 'critical'
				: cpuStatus === 'warning' || memoryStatus === 'warning'
					? 'warning'
					: 'good',
		cpu: cpuStatus,
		memory: memoryStatus,
		uptime: Math.floor(system.uptime / 3600) + ' hours',
	};
});

const kpis = new MetaSubscriber(
	{ context: dashboard, key: 'users' },
	{ context: dashboard, key: 'sales' },
	(users, sales) => ({
		activeUsers: users.active,
		userGrowth: ((users.active / users.total) * 100).toFixed(1) + '%',
		dailySales: '$' + sales.today.toLocaleString(),
		monthlySales: '$' + sales.thisMonth.toLocaleString(),
	}),
);

// WebSocket updates
const ws = new WebSocket('wss://api.example.com/dashboard');
ws.onmessage = event => {
	const data = JSON.parse(event.data);
	Object.assign(dashboard, data); // Bulk update triggers all subscriptions
};

// UI rendering
kpis.subscribe(data => updateKPIWidgets(data));
healthStatus.subscribe(status => updateSystemStatus(status));
```

## Error Handling

### Parser Error Recovery

Context handles parser failures gracefully:

```js
const state = new Context({ data: 'invalid-json' });

// Parser that might fail
const parsed = state.subscriber('data', data => {
	try {
		return JSON.parse(data);
	} catch (error) {
		// In development: logs warning with context
		// In production: returns null silently
		return null;
	}
});

parsed.subscribe(result => {
	if (result === null) {
		console.log('Failed to parse data');
	} else {
		console.log('Parsed successfully:', result);
	}
});
```

### Cleanup Error Isolation

Failed cleanup operations don't affect other resources:

```js
const state = new Context({ count: 0 });

// Subscription with problematic cleanup
const sub1 = state.subscriber('count', count => {
	// Simulate cleanup that might fail
	if (Math.random() > 0.5) throw new Error('Cleanup failed');
	return count * 2;
});

const sub2 = state.subscriber('count', count => count + 1);

// Even if sub1 cleanup fails, sub2 is still cleaned up
state.destroy(); // Continues cleaning other subscriptions
```

### Validation

Context validates constructor arguments:

```js
// ❌ These throw immediately
new Context(); // Error: initialState is required
new Context('string'); // Error: initialState must be object
new Context(null); // Error: initialState cannot be null

// ✅ Valid constructors
new Context({});
new Context({ prop: 'value' });
```

## Performance

### Memory Efficiency

- **Automatic cleanup** - No manual subscription management required
- **Weak references** - Subscriptions don't prevent garbage collection
- **Event consolidation** - Multiple property changes batched into single events
- **Lazy evaluation** - Parsers only run when values are accessed or subscriptions exist

### Optimization Strategies

```js
// ✅ Efficient: Direct property access
state.count++;
state.items.push(newItem);

// ❌ Inefficient: Unnecessary object creation
state.items = [...state.items, newItem];

// ✅ Efficient: Debounced multi-property updates
const summary = new MetaSubscriber(
	{ context: state, key: 'prop1' },
	{ context: state, key: 'prop2' },
	combiner,
	{ debounceMs: 100 }, // Batch rapid changes
);

// ✅ Efficient: Cleanup unused subscriptions
if (component.destroyed) {
	subscriber.destroy();
}
```
