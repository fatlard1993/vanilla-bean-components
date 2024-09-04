import { plugin } from 'bun';

plugin({
	name: '.md loader',
	async setup(build) {
		const { readFileSync } = await import('fs');
		const { marked } = await import('marked');

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
