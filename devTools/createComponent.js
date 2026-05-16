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
	test('must render', async () => {
		new ${name}({ appendTo: container });
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

const defaultOptions = { tag: 'div' };

/**
 * [Component description - describe what this component does and its primary purpose]
 *
 * [Optional: Additional context about when to use this component or special behaviors]
 *
 * @param {object} [options={}] - Component configuration options
 * @param {string} [options.tag='div'] - HTML tag name for the root element
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {${name}} Component instance with reactive options
 * @example
 * // Basic usage
 * new ${name}({
 *   // Add example options here
 * });
 */
class ${name} extends Component {
	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, ...children);
	}

	/**
	 * Creates component structure before options are processed.
	 */
	build() {
		// Create child elements here — this runs before options are processed
	}

	/**
	 * Routes option changes to appropriate handlers.
	 *
	 * @param {string} key - Option property name
	 * @param {*} value - New option value
	 * @private
	 */
	_setOption(key, value) {
		super._setOption(key, value);
	}
}

export default ${name};
`;

await Bun.write(`${componentFolder}/${name}.js`, componentFile);
await Bun.write(`${componentFolder}/.test.js`, testFile);
await Bun.write(`${componentFolder}/demo.js`, demoFile);
await Bun.write(`${componentFolder}/README.md`, readMeFile);
await Bun.write(`${componentFolder}/index.js`, `export { default as ${name} } from './${name}';`);

await Bun.spawn(['bun', 'run', 'build:index']).exited;
await Bun.spawn(['bun', 'run', 'format']).exited;
