import fs from 'fs';

import { capitalize } from '../utils/string';

const name = capitalize(process.argv[2]);
const componentFolder = `components/${name}`;

if (fs.existsSync(componentFolder)) throw new Error(`Component '${name}' already exists`);

fs.mkdirSync(componentFolder);

const testFile = `import { ${name} } from '.';

describe('${name}', () => {
	test('must render', async () => {
		new ${name}({ appendTo: container });
	});
});
`;

const demoFile = `import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { ${name} } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new ${name}({
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
`;

const readMeFile = `\`\`\`javascript
new ${name}({

})
\`\`\`
`;

const componentFile = `import { DomElem } from '../DomElem';

const defaultOptions = { tag: 'div' };

class ${name} extends DomElem {
	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, ...children);
	}

	render() {
		super.render();
	}

	setOption(key, value) {
		super.setOption(key, value);
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
