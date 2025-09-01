import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { marked } from 'marked';
import EmojiConverter from 'emoji-js';

import { customAlphabet } from 'nanoid';

import { removeExcessIndentation } from '../utils/string';
import { processTemplate } from '../devTools/processTemplate.js';

// eslint-disable-next-line spellcheck/spell-checker
const idGen = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 10);

const emoji = new EmojiConverter();
emoji.replace_mode = 'unified';
emoji.allow_native = true;

const copyToClipboardButton = id =>
	`<button class="icon fa-support fa-copy" title="Copy to clipboard" onpointerup="if (isSecureContext) window.navigator.clipboard.writeText(document.getElementById('${id}').textContent); alert('copied text to clipboard');"}></button>`;

// Legacy extraction functions removed - now handled by JSDoc system

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

	// First process JSDoc extraction commands using our comprehensive system
	const jsdocProcessed = processTemplate(markdown, dirname(path));

	// Then handle remaining template commands with legacy system
	const processedMarkdown = jsdocProcessed
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

		// JSDoc extraction commands are now handled by processTemplate above
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
			// Handle regular markdown files - check if file exists first
			try {
				const text = await Bun.file(path).text();
				const parsed = parseMarkdown(text, path);

				// For build-time, export as ES module for dynamic imports
				if (format === 'build') {
					return {
						contents: `export default ${JSON.stringify(parsed)};`,
						loader: 'js',
					};
				}

				return { exports: { default: parsed }, loader: 'object' };
			} catch {
				// File doesn't exist - return empty content
				console.warn(`Markdown file not found: ${path}`);
				if (format === 'build') {
					return {
						contents: `export default '';`,
						loader: 'js',
					};
				}
				return { exports: { default: '' }, loader: 'object' };
			}
		});
	},
});

export const buildLoader = loader('build');

export const runtimeLoader = loader('runtime');
