import { componentReadme } from './componentReadme';

const template = await Bun.file('devTools/COMPONENT_README_TEMPLATE.md').text();

describe('componentReadme', () => {
	test('a component with no README gets the template, filled from its JSDoc', () => {
		const markdown = componentReadme({ name: 'Keyboard', template });

		expect(markdown).toContain('Virtual keyboard component');
		expect(markdown).toMatch(/^## Options$/m);
		expect(markdown).toContain('### `setLayout(name)`');
	});

	test('a hand-written README is shown, with the extracted reference after it', () => {
		const readme = '# Dialog\n\nA modal, said by hand.\n\n## Usage\n\nOpen it.\n';
		const markdown = componentReadme({ name: 'Dialog', template, readme });

		expect(markdown.startsWith('A modal, said by hand.')).toBe(true);
		expect(markdown).toMatch(/^## Usage$/m);
		expect(markdown.indexOf('## Reference')).toBeGreaterThan(markdown.indexOf('Open it.'));
		expect(markdown).toMatch(/^### Options$/m);
		expect(markdown).not.toMatch(/^## Options$/m);
	});

	test('sections the JSDoc leaves empty are dropped', () => {
		const markdown = componentReadme({ name: 'Keyboard', template });

		expect(markdown).not.toMatch(/^## Enums$/m);
		expect(markdown).not.toMatch(/^## Design$/m);
	});

	test("a README's relative links become the explorer's routes", () => {
		const readme =
			'# Menu\n\nSee [Popover](../Popover/README.md), the [rules](../../docs/USAGE_RULES.md#forms) and [ethos](../../docs/ETHOS.md).\n';
		const markdown = componentReadme({ name: 'Menu', template, readme });

		expect(markdown).toContain('[Popover](#/Popover)');
		expect(markdown).toContain('[rules](#/documentation/usage?section=forms)');
		expect(markdown).toContain('[ethos](../../docs/ETHOS.md)');
	});
});
