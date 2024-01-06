import { plugin } from 'bun';

import Prism from 'prismjs';

import { removeExcessIndentation } from '../DomElem/utils/string';

const codeToHTML = (code, language) =>
	Prism.highlight(removeExcessIndentation(code), Prism.languages[language], language);

plugin({
	name: '.md loader',
	async setup(build) {
		const { readFileSync } = await import('fs');
		const { Marked } = await import('marked');
		const { markedHighlight } = await import('marked-highlight');

		const marked = new Marked(
			markedHighlight({ highlight: (code, language = 'plaintext') => codeToHTML(code, language) }),
		);

		build.onLoad({ filter: /\.md$/ }, ({ path }) => {
			const text = readFileSync(path, 'utf8');
			const parsed = marked
				.parse(text)
				.replaceAll(/<pre><code class="language-([^\s"]+)/g, '<pre class="language-$1"><code class="language-$1');

			return {
				exports: { text, parsed },
				loader: 'object',
			};
		});
	},
});
