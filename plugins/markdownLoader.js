import { plugin } from 'bun';

import { customAlphabet } from 'nanoid';

// eslint-disable-next-line spellcheck/spell-checker
const idGen = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 10);

const copyToClipboardButton = id =>
	`<button class="icon fa-support fa-copy" title="Copy to clipboard" onpointerup="if (isSecureContext) window.navigator.clipboard.writeText(document.getElementById('${id}').textContent); alert('copied text to clipboard');"}></button>`;

plugin({
	name: '.md loader',
	async setup(build) {
		const { readFileSync } = await import('fs');
		const { marked } = await import('marked');

		build.onLoad({ filter: /\.md$/ }, ({ path }) => {
			const id = idGen();
			const text = readFileSync(path, 'utf8');
			const parsed = marked
				.parse(text)
				.replaceAll(
					/<pre><code class="language-([^\s"]+)/g,
					`<pre class="language-$1">${copyToClipboardButton(id)}<code id=${id} class="language-$1`,
				);

			return {
				exports: { text, parsed },
				loader: 'object',
			};
		});
	},
});
