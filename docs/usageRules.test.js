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

describe('every component has a row in the usage rules', () => {
	const rows = new Map(
		[
			...rules
				.split('## Every component')[1]
				.split('\n## ')[0]
				.matchAll(/^\| (\w+) \| (.+) \|$/gm),
		].map(([, name, cell]) => [name, cell]),
	);

	rows.delete('Component');
	const components = readdirSync(`${import.meta.dir}/../components`, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => entry.name);

	test('the table names each component folder, and only those', () => {
		expect([...rows.keys()].sort()).toEqual(components.sort());
	});

	test('each row links rules that exist, under their own section, or says why it has none', () => {
		for (const [name, cell] of rows) {
			const links = [...cell.matchAll(/\[([a-z]+\.[a-z-]+)\]\(#([^)]+)\)/g)];

			if (!links.length) expect(`${name}: ${cell}`).toMatch(/No rule yet|overlay choice/);

			for (const [, id, anchor] of links) {
				expect(ruleIds).toContain(id);
				expect(anchor).toBe(sectionAnchors.values().find(section => section.startsWith(sectionOf(id))));
			}
		}
	});
});

test("a component's README links the rules its row names", async () => {
	const rows = new Map(
		[
			...rules
				.split('## Every component')[1]
				.split('\n## ')[0]
				.matchAll(/^\| (\w+) \| (.+) \|$/gm),
		].map(([, name, cell]) => [name, [...cell.matchAll(/\[([a-z]+\.[a-z-]+)\]/g)].map(([, id]) => id).sort()]),
	);

	for (const path of componentDocs) {
		const file = Bun.file(path);
		if (!(await file.exists())) continue;

		const name = path.split('/').at(-2);
		const linked = [...(await file.text()).matchAll(/\[([a-z]+\.[a-z-]+)\]\(\.\.\/\.\.\/docs/g)].map(([, id]) => id);

		expect({ name, rules: [...new Set(linked)].sort() }).toEqual({ name, rules: rows.get(name) });
	}
});
