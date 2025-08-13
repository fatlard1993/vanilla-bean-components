import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { marked } from 'marked';
import EmojiConverter from 'emoji-js';

import { customAlphabet } from 'nanoid';

import { removeExcessIndentation } from '../utils/string';

// eslint-disable-next-line spellcheck/spell-checker
const idGen = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 10);

const emoji = new EmojiConverter();
emoji.replace_mode = 'unified';
emoji.allow_native = true;

const copyToClipboardButton = id =>
	`<button class="icon fa-support fa-copy" title="Copy to clipboard" onpointerup="if (isSecureContext) window.navigator.clipboard.writeText(document.getElementById('${id}').textContent); alert('copied text to clipboard');"}></button>`;

const extractDefaultOptions = fileText => {
	const match = fileText.match(/const\s+defaultOptions\s*=\s*\{([^}]*)\}/);
	if (!match) return '';

	const optionsContent = match[1].trim();

	if (!optionsContent) return '';

	const options = [];

	const items = optionsContent
		.split(',')
		.map(item => item.trim())
		.filter(item => item);

	for (const item of items) {
		if (!item || item.startsWith('//') || item.startsWith('/*') || !item.includes(':')) {
			continue;
		}

		const colonIndex = item.indexOf(':');
		if (colonIndex === -1) continue;

		const key = item.substring(0, colonIndex).trim();
		let value = item.substring(colonIndex + 1).trim();

		if (value.includes('new Set(')) {
			value = value.replace(/new Set\(\[(.*?)\]\)/, 'Set: [$1]');
		}

		options.push(`- **${key}**: \`${value}\``);
	}

	return options.length > 0 ? options.join('\n') : '';
};

const extractMethods = fileText => {
	const methodRegex = /\/\*\*([\s\S]*?)\*\/\s*(\w+)\s*\(([^)]*)\)/g;
	const methods = [];
	let match;

	while ((match = methodRegex.exec(fileText)) !== null) {
		const [, jsdocComment, methodName, params] = match;
		if (!methodName.startsWith('_') && methodName !== 'constructor') {
			const lines = jsdocComment.split('\n').map(line => line.replace(/^\s*\*\s?/, '').trim());
			const description = lines.find(line => line && !line.startsWith('@')) || methodName;

			const paramList = params.trim() ? ` (${params.trim()})` : '()';

			methods.push(`- **${methodName}${paramList}** - ${description}`);
		}
	}

	return methods.length > 0 ? methods.join('\n') : '';
};

const extractImports = fileText => {
	const relativeImportRegex = /import\s+.*?from\s+['"](\.\.[^'"]+)['"]/g;
	const externalImportRegex = /import\s+.*?from\s+['"]([^.][^'"]*)['"]/g;
	const imports = [];
	let match;

	while ((match = relativeImportRegex.exec(fileText)) !== null) {
		const path = match[1];
		const segments = path.split('/');
		const name = segments.pop();

		if (!name || name.includes('.')) continue;

		let link;
		if (name === 'Component' || name === 'Elem' || name === 'styled' || segments[segments.length - 1] === 'Context') {
			link = `#/documentation/${name}`;
		} else if (segments.includes('utils')) {
			link = `#/documentation/utils`;
		} else if (segments.includes('..') && segments.length <= 3) {
			link = `#/${name}`;
		} else {
			link = `#/documentation/${name}`;
		}

		imports.push(`- [${name}](${link})`);
	}

	while ((match = externalImportRegex.exec(fileText)) !== null) {
		const moduleName = match[1];

		if (moduleName.startsWith('.') || moduleName.startsWith('/')) continue;

		let link;
		let displayName = moduleName;

		if (
			moduleName.startsWith('node:') ||
			['fs', 'path', 'url', 'util', 'events', 'stream', 'crypto', 'http', 'https'].includes(moduleName)
		) {
			const cleanName = moduleName.replace('node:', '');
			link = `https://nodejs.org/api/${cleanName}.html`;
			displayName = cleanName;
		} else {
			try {
				const packageJsonPath = resolve('node_modules', moduleName, 'package.json');
				const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

				if (packageJson.homepage) {
					link = packageJson.homepage;
				} else if (packageJson.repository) {
					if (typeof packageJson.repository === 'string') {
						if (packageJson.repository.startsWith('github:')) {
							link = `https://github.com/${packageJson.repository.replace('github:', '')}`;
						} else if (packageJson.repository.includes('github.com')) {
							link = packageJson.repository.replace(/^git\+/, '').replace(/\.git$/, '');
						} else {
							link = packageJson.repository;
						}
					} else if (packageJson.repository.url) {
						link = packageJson.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
					}
				} else {
					link = `https://www.npmjs.com/package/${moduleName}`;
				}
			} catch {
				link = `https://www.npmjs.com/package/${moduleName}`;
			}
		}

		imports.push(`- [${displayName}](${link})`);
	}

	return imports.length > 0 ? imports.join('\n') : '';
};

const extractProperties = fileText => {
	const propertyRegex = /_setOption\(key,\s*value\)\s*{[\s\S]*?if\s*\(\s*key\s*===\s*['"`]([^'"`]+)['"`]/g;
	const properties = new Set();
	let match;

	while ((match = propertyRegex.exec(fileText)) !== null) {
		properties.add(match[1]);
	}

	const optionsRegex = /this\.options\.(\w+)/g;
	while ((match = optionsRegex.exec(fileText)) !== null) {
		properties.add(match[1]);
	}

	const uniqueProps = Array.from(properties).sort();
	return uniqueProps.length > 0 ? uniqueProps.map(prop => `- **${prop}**`).join('\n') : '';
};

const extractEvents = fileText => {
	const eventRegex = /(?:addEventListener|on[A-Z]\w*|emit|dispatch|trigger).*?['"`]([^'"`]+)['"`]/g;
	const events = new Set();
	let match;

	while ((match = eventRegex.exec(fileText)) !== null) {
		if (!match[1].includes(' ') && match[1].length > 2) {
			events.add(match[1]);
		}
	}

	const uniqueEvents = Array.from(events).sort();
	return uniqueEvents.length > 0 ? uniqueEvents.map(event => `- **${event}**`).join('\n') : '';
};

const extractUsage = fileText => {
	const usageRegex = /(\t*).*?component\s*=\s*new\s+\w+\s*\(\s*{([\s\S]*?)\n\1\}\s*\)/g;
	const matches = Array.from(fileText.matchAll(usageRegex));

	if (matches.length === 0) {
		return '';
	}

	const longestMatch = matches.reduce((longest, current) =>
		current[0].length > longest[0].length ? current : longest,
	);

	return longestMatch[0];
};

const extractEnums = fileText => {
	const enumRegex = /const\s+(\w+)_enum\s*=\s*Object\.freeze\(\[(.*?)\]\)/gs;
	const enums = [];
	let match;

	while ((match = enumRegex.exec(fileText)) !== null) {
		const enumName = match[1];
		const enumValues = match[2]
			.split(',')
			.map(value => value.trim().replace(/['"`]/g, ''))
			.filter(value => value && value !== '');

		enums.push(`- **${enumName}**: \`${enumValues.join('` | `')}\``);
	}

	return enums.length > 0 ? enums.join('\n') : '';
};

const extractCustomEvents = fileText => {
	const eventRegex = /(?:this\.emit|emit)\s*\(\s*['"`]([^'"`]+)['"`]/g;
	const events = new Set();
	let match;

	while ((match = eventRegex.exec(fileText)) !== null) {
		const eventName = match[1];
		if (eventName && !eventName.includes(' ') && eventName.length > 1) {
			events.add(eventName);
		}
	}

	const uniqueEvents = Array.from(events).sort();
	return uniqueEvents.length > 0 ? uniqueEvents.map(event => `- **${event}** - Custom component event`).join('\n') : '';
};

const extractDesign = (fileText, markdownPath) => {
	const designPath = resolve(dirname(markdownPath), 'design.excalidraw.png');
	try {
		readFileSync(designPath);

		const componentName = dirname(markdownPath).split('/').pop();
		return `![design](../${componentName}/design.excalidraw.png)`;
	} catch {
		return '';
	}
};

export const parseMarkdown = (markdown, path) => {
	const id = idGen();

	const processedMarkdown = markdown
		.replaceAll(/\[\[import\s(\S+)]](?:\/(.+)\/([gimsuy]+))?/g, (input, filename, regex, regexFlags) => {
			const fileText = readFileSync(resolve(dirname(path), filename), 'utf8');

			if (regex) {
				try {
					const parsedRegex = new RegExp(regex, regexFlags);
					const regexResults = parsedRegex.exec(fileText);
					const regexMatch = regexResults?.[0];

					if (!regexMatch) {
						console.error('No regex match', { filename, regex, regexFlags, parsedRegex, regexResults });
						return fileText;
					}

					return removeExcessIndentation(regexMatch);
				} catch (error) {
					console.error('Could not apply regex', { filename, regex, regexFlags }, error);
				}
			}

			return fileText;
		})

		.replaceAll(/\[\[extract-options\s(\S+)]]/g, (input, filename) => {
			const fileText = readFileSync(resolve(dirname(path), filename), 'utf8');
			return extractDefaultOptions(fileText);
		})
		.replaceAll(/\[\[extract-methods\s(\S+)]]/g, (input, filename) => {
			const fileText = readFileSync(resolve(dirname(path), filename), 'utf8');
			return extractMethods(fileText);
		})
		.replaceAll(/\[\[extract-imports\s(\S+)]]/g, (input, filename) => {
			const fileText = readFileSync(resolve(dirname(path), filename), 'utf8');
			return extractImports(fileText);
		})
		.replaceAll(/\[\[extract-properties\s(\S+)]]/g, (input, filename) => {
			const fileText = readFileSync(resolve(dirname(path), filename), 'utf8');
			return extractProperties(fileText);
		})
		.replaceAll(/\[\[extract-events\s(\S+)]]/g, (input, filename) => {
			const fileText = readFileSync(resolve(dirname(path), filename), 'utf8');
			return extractEvents(fileText);
		})
		.replaceAll(/\[\[extract-usage\s(\S+)]]/g, (input, filename) => {
			const fileText = readFileSync(resolve(dirname(path), filename), 'utf8');
			return extractUsage(fileText);
		})
		.replaceAll(/\[\[extract-enums\s(\S+)]]/g, (input, filename) => {
			const fileText = readFileSync(resolve(dirname(path), filename), 'utf8');
			return extractEnums(fileText);
		})
		.replaceAll(/\[\[extract-custom-events\s(\S+)]]/g, (input, filename) => {
			const fileText = readFileSync(resolve(dirname(path), filename), 'utf8');
			return extractCustomEvents(fileText);
		})
		.replaceAll(/\[\[extract-design\]\]/g, () => {
			return extractDesign('', path);
		})

		.replace(/## [^\n]*\n+(?=## |$)/g, '')

		.replace(/\n{3,}/g, '\n\n');

	const parsed = marked
		.parse(processedMarkdown)
		.replaceAll(
			/<pre><code class="language-([^\s"]+)/g,
			`<pre class="language-$1">${copyToClipboardButton(id)}<code id=${id} class="language-$1`,
		)
		.replaceAll(/<blockquote>\s?<p>\s?\[!(\w+)]/g, `<blockquote class="$1"><p>$1</p><p>`);

	return emoji.replace_colons(parsed);
};

const loader = format => ({
	name: '.md loader',
	async setup(build) {
		build.onLoad({ filter: /\.md$/ }, async ({ path }) => {
			const text = await Bun.file(path).text();
			const parsed = parseMarkdown(text, path);

			return format === 'build'
				? { contents: parsed, loader: 'text' }
				: { exports: { default: parsed }, loader: 'object' };
		});
	},
});

export const buildLoader = loader('build');

export const runtimeLoader = loader('runtime');
