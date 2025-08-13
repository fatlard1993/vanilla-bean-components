import { basename } from 'node:path';
import { Glob } from 'bun';

import { orderBy } from '../utils/data';

const demos = [...new Glob('components/*/demo.js').scanSync('.')].sort(orderBy([{ direction: 'asc' }]));
const examples = [...new Glob('demo/examples/*.js').scanSync('.')]
	.filter(file => !file.endsWith('.test.js'))
	.sort(orderBy([{ direction: 'asc' }]));
const documentation = [...new Glob('./*/README.md').scanSync('.')].sort(orderBy([{ direction: 'asc' }]));

let result = `/* This file is automatically managed (bun build:index) (${basename(process.argv[1])}), do not edit by hand */\n\n`;

result += `import { styled } from '../styled/styled.js';\n\n`;

demos.forEach(file => {
	const match = file.match(/(.+?)\/(.+)\/(.+?)(\..+)?$/);
	result += `import ${match[2]}Demo from '../components/${match[2]}/demo.js';\n`;
});

result += '\n';

examples.forEach(file => {
	const match = file.match(/(.+)\/(.+?)(\..+)?$/);
	result += `import ${match[2]}Example from './examples/${match[2]}';\n`;
});

result += `\nimport DocumentationView from './DemoView/DocumentationView.js';\n\n`;

result += `const startDocumentation = styled(DocumentationView, () => '', { fileName: 'docs/GETTING_STARTED.md', nextLabel: 'Elem', nextUrl: '#/documentation/Elem' });\nconst MarkdownDocumentation = styled(DocumentationView, () => '', { folderName: 'markdown' });\n`;

const documentationChain = {
	demo: `, nextLabel: 'Getting Started', nextUrl: '#/documentation/start'`,
	Elem: `, nextLabel: 'Component', nextUrl: '#/documentation/Component'`,
	Component: `, nextLabel: 'Context', nextUrl: '#/documentation/Context'`,
	Context: `, nextLabel: 'styled', nextUrl: '#/documentation/styled'`,
	styled: `, nextLabel: 'theme', nextUrl: '#/documentation/theme'`,
	theme: `, nextLabel: 'request', nextUrl: '#/documentation/request'`,
};

documentation.forEach(file => {
	const [, , name] = file.match(/(.+?)\/(.+)\/(.+?)(\..+)?$/);
	result += `const ${name}Documentation = styled(DocumentationView, () => '', { folderName: '${name}'${documentationChain[name] || ''} });\n`;
});

result += '\nexport default {\n';

demos.forEach(file => {
	const match = file.match(/(.+?)\/(.+)\/(.+?)(\..+)?$/);
	result += `\t['/${match[2]}']: ${match[2]}Demo,\n`;
});

result += '\n';

examples.forEach(file => {
	const match = file.match(/(.+)\/(.+?)(\..+)?$/);
	result += `\t['/examples/${match[2]}']: ${match[2]}Example,\n`;
});

result += `\n\t['/documentation/start']: startDocumentation,\n\t['/documentation/markdown']: MarkdownDocumentation,\n`;

documentation.forEach(file => {
	const match = file.match(/(.+?)\/(.+)\/(.+?)(\..+)?$/);
	result += `\t['/documentation/${match[2]}']: ${match[2]}Documentation,\n`;
});

result += '};\n';

await Bun.write('demo/views.js', result);
