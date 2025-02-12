import fs from 'fs';

import { capitalize } from '../utils/string';

const options = process.argv[3] ? JSON.parse(process.argv[3]) : {};

const name = capitalize(process.argv[2]);
const componentFolder = `components/${name}`;

if (fs.existsSync(componentFolder)) throw new Error(`Component '${name}' already exists`);

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
	render() {
		this.component = new ${name}({
			${demoOptions}
		});

		super.render();
	}
}
`;

const readMeFile = `\`\`\`js
[[import ./demo.js]]/^(\\t*).+component = new.+\\(\\s*{(.|\\n)+?\\1}?\\);/gm
\`\`\`

## Design

![design](../${name}/design.excalidraw.png)

`;

const componentFile = `import { Component } from '../../Component';

const defaultOptions = { tag: 'div' };

class ${name} extends Component {
	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, ...children);
	}

	render() {
		super.render();
	}

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

Bun.spawn(['bun', 'run', 'build:index']);
Bun.spawn(['bun', 'run', 'format']);
