import { describe, expect, test } from 'bun:test';

import { headingId, parseMarkdown } from './markdownLoader';

describe('headingId', () => {
	test('matches the id GitHub gives a heading', () => {
		expect(headingId('Overlays and feedback')).toBe('overlays-and-feedback');
		expect(headingId('Page shell and layout')).toBe('page-shell-and-layout');
		expect(headingId('<code>open()</code> &amp; close')).toBe('open--close');
		expect(headingId('Example - full SPA shell')).toBe('example---full-spa-shell');
	});
});

describe('parseMarkdown', () => {
	test('a heading carries its id, so a link to a section lands on it', () => {
		const html = parseMarkdown('# Rules\n\n## Open questions\n\nStill undecided.\n', 'docs/RULES.md');

		expect(html).toContain('<h1 id="rules">Rules</h1>');
		expect(html).toContain('<h2 id="open-questions">Open questions</h2>');
	});
});
