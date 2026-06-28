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
			`${key}: ${
				typeof value === 'object'
					? JSON.stringify(value)
							.replaceAll(/"(\w+)":/g, ` $1: `)
							.replaceAll('"', `'`)
					: value
			},`,
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

const readMeFile = `# ${name}

[[extract-description ${name}.js]]

## Usage

\`\`\`js
[[import ./demo.js]]/^(\\t*).+component = new.+\\(\\s*{(.|\\n)+?\\1}?\\);/gm
\`\`\`

## Options

[[extract-options ${name}.js]]

## Methods

[[extract-methods ${name}.js]]

## Properties

[[extract-properties ${name}.js]]

## Events

[[extract-events ${name}.js]]

## Dependencies

[[extract-imports ${name}.js]]

## Design

![design](../${name}/design.excalidraw.png)
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
		// Create child elements here — this runs before options are processed
	}

	// Handle custom option keys with static handlers.
	// Each handler receives (value, next) — call next(value) to pass through to standard
	// routing, or omit it to fully own the key. Write to elem directly, not options:
	//
	// static handlers = {
	//   myOption(value) {
	//     this.myChild.elem.textContent = value;
	//   },
	// };
}
`;

await Bun.write(`${componentFolder}/${name}.js`, componentFile);
await Bun.write(`${componentFolder}/.test.js`, testFile);
await Bun.write(`${componentFolder}/demo.js`, demoFile);
await Bun.write(`${componentFolder}/README.md`, readMeFile);
await Bun.write(`${componentFolder}/index.js`, `export { default as ${name} } from './${name}';`);

await Bun.spawn(['bun', 'run', 'build:index']).exited;
await Bun.spawn(['bun', 'run', 'format']).exited;
