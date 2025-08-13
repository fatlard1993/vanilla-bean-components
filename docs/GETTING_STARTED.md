# Getting Started

This guide will walk you through setting up vanilla-bean-components from scratch and building your first reactive application. But - Since this is intended to primarily be a development pattern, so I'll simply recommend what I currently do. Feel free to stray from the path wherever makes sense for your use-case.

## Installation

```bash
# Using Bun (recommended)
bun add github:fatlard1993/vanilla-bean-components
```

## Basic HTML Setup

Create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>My App</title>
		<script type="module" src="./main.js"></script>
	</head>
	<body></body>
</html>
```

## Your First Component

Create `main.js`:

```js
import { Component, Context } from 'vanilla-bean-components';

// Create reactive state
const state = new Context({
	count: 0,
	message: 'Hello, World!',
});

// Create a simple counter component
const counter = new Component({
	tag: 'div',
	style: {
		padding: '20px',
		textAlign: 'center',
		fontFamily: 'system-ui',
	},
	append: [
		new Component({
			tag: 'h1',
			textContent: state.subscriber('message'),
		}),
		new Component({
			tag: 'p',
			textContent: state.subscriber('count', count => `Count: ${count}`),
			style: { fontSize: '24px', margin: '20px 0' },
		}),
		new Component({
			tag: 'button',
			textContent: 'Increment',
			style: {
				padding: '10px 20px',
				fontSize: '16px',
				marginRight: '10px',
			},
			onPointerPress: () => state.count++,
		}),
		new Component({
			tag: 'button',
			textContent: 'Reset',
			onPointerPress: () => (state.count = 0),
		}),
	],
	appendTo: document.body,
});
```

## Understanding the Basics

### Components

Components wrap HTML elements with reactive capabilities:

```js
const myComponent = new Component({
	tag: 'div', // HTML element type
	textContent: 'Hello', // Properties set directly on element
	className: 'my-class', // Standard HTML attributes
	onPointerPress: () => {}, // Event handlers
	style: {
		// Inline styles as object
		color: 'blue',
		padding: '10px',
	},
	append: [child1, child2], // Child elements
	appendTo: document.body, // Where to render
});
```

### Reactive State with Context

Context creates observable state that automatically updates the UI:

```js
const state = new Context({
	user: { name: 'John', email: 'john@example.com' },
	isLoggedIn: false,
	notifications: [],
});

// Subscribe to changes
const greeting = state.subscriber('user', user => `Welcome, ${user.name}!`);
const badge = state.subscriber('notifications', notes => notes.length);

// Direct property access triggers updates
state.isLoggedIn = true;
state.notifications.push({ message: 'New message' });
```

## Working with Forms

Create a contact form with validation:

```js
import { Form, Button, Select } from 'vanilla-bean-components';

const contactForm = new Form({
	data: {
		name: '',
		email: '',
		subject: 'general',
		message: '',
	},
	inputs: [
		{
			key: 'name',
			label: 'Full Name',
			validations: [
				[/.+/, 'Name is required'],
				[/^.{2,50}$/, 'Name must be 2-50 characters'],
			],
		},
		{
			key: 'email',
			label: 'Email Address',
			type: 'email',
			validations: [[/.+@.+\..+/, 'Valid email required']],
		},
		{
			key: 'subject',
			label: 'Subject',
			InputComponent: Select,
			options: ['general', 'support', 'billing', 'feature-request'],
		},
		{
			key: 'message',
			label: 'Message',
			tag: 'textarea',
			validations: [[/.{10,}/, 'Message must be at least 10 characters']],
		},
	],
	append: new Button({
		textContent: 'Send Message',
		onPointerPress: () => {
			if (contactForm.validate()) {
				console.log('Form has errors');
				return;
			}

			console.log('Form data:', contactForm.options.data);
			// Submit form data...
		},
	}),
	appendTo: document.body,
});
```

## HTTP Requests with Caching

The request system provides intelligent caching and subscriptions:

```js
import { GET, POST } from 'vanilla-bean-components/request';

// Cached request with live updates
const { body: users } = await GET('/api/users', {
	apiId: 'users',
	onRefetch: ({ body }) => {
		// Called whenever data changes
		updateUserList(body);
	},
});

// Mutations that trigger automatic refetch
await POST('/api/users', {
	body: { name: 'New User', email: 'user@example.com' },
	invalidates: ['users'], // Clears cache and triggers refetch
});

// The users list automatically updates with fresh data
```

## Styling and Theming

### Using the Theme System

```js
import { styled } from 'vanilla-bean-components';
import { Component } from 'vanilla-bean-components';

const ThemedButton = styled(
	Component,
	({ colors, fonts }) => `
    ${fonts.kodeMono}
    background: ${colors.blue};
    color: ${colors.mostReadable(colors.blue, [colors.white, colors.black])};
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
        background: ${colors.dark(colors.blue)};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`,
);
```

### Template Literal Syntax

```js
const StyledCard = styled.Component`
	background: ${({ colors }) => colors.darker(colors.gray)};
	border-radius: 8px;
	padding: 20px;
	box-shadow: 0 4px 12px ${({ colors }) => colors.black.setAlpha(0.2)};

	h2 {
		color: ${({ colors }) => colors.light(colors.blue)};
		margin-top: 0;
	}
`;
```

## Next Steps

Now that you have the basics:

1. **Explore Components**: Check out the built-in components in `/components/` like `Dialog`, `Calendar`, `ColorPicker`, etc.

2. **Learn Advanced Patterns**: Study the demo applications in `/demo/` for complex examples.

3. **Master Styling**: Read the [styled system documentation](./styled/README.md) for advanced theming.

4. **State Management**: Dive deeper into [Context patterns](./Context/README.md) for complex state.

5. **HTTP Integration**: Learn about [request caching and subscriptions](./request/README.md).

The library is designed to grow with your needs - start simple and add complexity as required.
