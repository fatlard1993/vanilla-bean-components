import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { marked } from 'marked';

import { customAlphabet } from 'nanoid';

import { removeExcessIndentation } from '../utils/string';

// eslint-disable-next-line spellcheck/spell-checker
const idGen = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 10);

const copyToClipboardButton = id =>
	`<button class="icon fa-support fa-copy" title="Copy to clipboard" onpointerup="if (isSecureContext) window.navigator.clipboard.writeText(document.getElementById('${id}').textContent); alert('copied text to clipboard');"}></button>`;

export const parseMarkdown = (markdown, path) => {
	const id = idGen();
	const parsed = marked
		.parse(
			markdown.replaceAll(/\[\[import\s(\S+)]](?:\/(.+)\/([gimsuy]+))?/g, (input, filename, regex, regexFlags) => {
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
			}),
		)
		.replaceAll(
			/<pre><code class="language-([^\s"]+)/g,
			`<pre class="language-$1">${copyToClipboardButton(id)}<code id=${id} class="language-$1`,
		);

	return parsed;
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
