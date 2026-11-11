import { readdirSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';

const rules = await Bun.file(`${import.meta.dir}/USAGE_RULES.md`).text();
const ruleIds = new Set([...rules.matchAll(/^\*\*([a-z]+\.[a-z-]+)\*\* · /gm)].map(([, id]) => id));
const sectionAnchors = new Set(
	[...rules.matchAll(/^## (.+)$/gm)].map(([, heading]) => heading.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')),
);

const componentDocs = readdirSync(`${import.meta.dir}/../components`, { withFileTypes: true })
	.filter(entry => entry.isDirectory())
	.map(entry => `${import.meta.dir}/../components/${entry.name}/README.md`);

describe('component READMEs link to rules that exist', async () => {
	for (const path of componentDocs) {
		const file = Bun.file(path);
		if (!(await file.exists())) continue;

		const links = [...(await file.text()).matchAll(/\[([^\]]*)\]\(\.\.\/\.\.\/docs\/USAGE_RULES\.md(?:#([^)]*))?\)/g)];
		if (!links.length) continue;

		test(path.split('/').at(-2), () => {
			for (const [, text, anchor] of links) {
				if (anchor) expect(sectionAnchors).toContain(anchor);
				if (/^[a-z]+\.[a-z-]+$/.test(text)) {
					expect(ruleIds).toContain(text);
					expect(anchor).toBe(sectionAnchors.values().find(section => section.startsWith(sectionOf(text))));
				}
			}
		});
	}
});

const sectionOf = id =>
	({ overlay: 'overlays', action: 'actions', layout: 'page-shell', form: 'forms', structure: 'structure' })[
		id.split('.')[0]
	];
