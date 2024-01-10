import { Glob } from 'bun';

import { orderBy } from '../utils/data';

const demos = [...new Glob('components/*/demo.js').scanSync('.')].sort(orderBy([{ direction: 'asc' }]));
const examples = [...new Glob('demo/examples/*').scanSync('.')].sort(orderBy([{ direction: 'asc' }]));

let result = '';

demos.forEach(file => {
	const match = file.match(/(.+?)\/(.+)\/(.+?)(\..+)?$/);
	result += `import ${match[2]}Demo from '../components/${match[2]}/demo.js';\n`;
});

result += '\n';

examples.forEach(file => {
	const match = file.match(/(.+)\/(.+?)(\..+)?$/);
	result += `import ${match[2]}Example from './examples/${match[2]}';\n`;
});

result += '\nexport default {\n';

demos.forEach(file => {
	const match = file.match(/(.+?)\/(.+)\/(.+?)(\..+)?$/);
	result += `\t['/${match[2]}']: ${match[2]}Demo,\n`;
});

result += '\n';

examples.forEach(file => {
	const match = file.match(/(.+)\/(.+?)(\..+)?$/);
	result += `\t['/${match[2]}']: ${match[2]}Example,\n`;
});

result += '};\n';

await Bun.write('demo/views.js', result);
