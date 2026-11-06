import fs from 'fs';

import { capitalize } from '../utils/string';

if (!process.argv[2]) {
	console.error('Usage: bun run create:component <ComponentName> [optionsJSON]');
	process.exit(1);
}

let options = {};
try {
	options = process.argv[3] ? JSON.parse(process.argv[3]) : {};
} catch {
	console.error('Invalid JSON options:', process.argv[3]);
	process.exit(1);
}

const name = capitalize(process.argv[2]);
const componentFolder = `components/${name}`;

if (fs.existsSync(componentFolder)) {
	console.error(`Component '${name}' already exists at ${componentFolder}`);
	process.exit(1);
}

fs.mkdirSync(componentFolder);

const demoOptions = Object.entries(options)
	.map(
		([key, value]) =>
			`${key}: ${JSON.stringify(value)
				.replaceAll(/"(\w+)":/g, ` $1: `)
				.replaceAll('"', `'`)},`,
	)
	.join('\n');

const testFile = `import { ${name} } from '.';

describe('${name}', () => {
	test('renders', () => {
		new ${name}({ appendTo: container });

		expect(container.firstElementChild).toBeDefined();
	});
});
`;

const demoFile = `import DemoView from '../../demo/DemoView';
import { ${name} } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new ${name}({
			${demoOptions}
		});
	}
}
`;

// Prose, as the other READMEs are: the explorer appends the reference sections (options, methods, events) from the
// JSDoc itself, so a README that extracted them would show each twice
const readMeFile = `# ${name}

What it is, in a sentence or two: the need it meets, and the shape it takes.

\`\`\`js
new ${name}({ appendTo: document.body });
\`\`\`

## Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
`;

const componentFile = `import { Component } from '../../Component';

/**
 * [Component description - describe what this component does and its primary purpose]
 *
 * [Optional: Additional context about when to use this component or special behaviors]
 *
 * @param {object} [options={}] - Component configuration options
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {${name}} Component instance with reactive options
 * @example
 * // Basic usage
 * new ${name}({
 *   // Add example options here
 * });
 */
export default class ${name} extends Component {
	/**
	 * Creates component structure before options are processed.
	 * Assign child elements to instance properties here so handlers can reference them.
	 */
	build() {
		// Create child elements here - this runs before options are processed
	}

	// Declare the option schema once with static schema - what can exist, the defaults,
	// and how each key routes. Descriptor fields:
	//   default - initial value, merged automatically (child classes override per-key)
	//   set(value, next) - change handler; omit next() to own the key, call it to continue
	//   enum: [...] - valid values; anything else throws
	//   attribute: true / priority: true - setAttribute routing / processed first
	//   Declared keys with no DOM match live in this.options silently - a bare {} declares
	//   a data-only key. data: true exists only to force store-only on DOM-name collisions.
	//
	// static schema = {
	//   label: {
	//     default: 'Untitled',
	//     set(value) {
	//       this.myChild.elem.textContent = value;
	//     },
	//   },
	//   items: {},
	// };
	//
	// Custom events: static events = ['select'];
	// Computed defaults (no constructor needed): static prepareOptions(options, children) { return options; }
}
`;

await Bun.write(`${componentFolder}/${name}.js`, componentFile);
await Bun.write(`${componentFolder}/.test.js`, testFile);
await Bun.write(`${componentFolder}/demo.js`, demoFile);
await Bun.write(`${componentFolder}/README.md`, readMeFile);
await Bun.write(`${componentFolder}/index.js`, `export { default as ${name} } from './${name}';`);

await Bun.spawn(['bun', 'run', 'build:index']).exited;
await Bun.spawn(['bun', 'run', 'format']).exited;
