import { basename } from 'node:path';
import { Glob } from 'bun';

import { orderBy } from '../utils/data';

const components = [...new Glob('components/*/index.js').scanSync('.')].sort(orderBy([{ direction: 'asc' }]));

let result = `/* This file is automatically managed (bun build:index) (${basename(process.argv[1])}), do not edit by hand */\n\n`;

components.forEach(file => {
	// eslint-disable-next-line unicorn/no-unreadable-array-destructuring
	const [, , name] = file.match(/(.+?)\/(.+)\/(.+?)(\..+)?$/);

	result += `export * from './${name}';\n`;
});

await Bun.write('components/index.js', result);
