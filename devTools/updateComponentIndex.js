import { Glob } from 'bun';
import { orderBy } from '../utils/data';

const components = [...new Glob('components/*/index.js').scanSync('.')].sort(orderBy([{ direction: 'asc' }]));

let result = '';

components.forEach(file => {
	const match = file.match(/(.+?)\/(.+)\/(.+?)(\..+)?$/);
	result += `export * from './${match[2]}';\n`;
});

result += "\nexport { default as context } from './context';\n";

await Bun.write('components/index.js', result);
