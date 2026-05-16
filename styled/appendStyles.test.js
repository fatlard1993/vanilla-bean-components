/// <reference lib="dom" />

import { appendStyles } from './appendStyles';

afterEach(() => {
	document.head.querySelectorAll('style').forEach(el => el.remove());
});

describe('appendStyles', () => {
	test('creates a style element with CSS content', () => {
		const css = '.test { margin: 0; }';
		const style = appendStyles(css);

		expect(style.innerHTML).toContain(css);
		expect(style.parentElement).toBe(document.head);
	});

	test('returns undefined for falsy CSS', () => {
		expect(appendStyles('')).toBeUndefined();
		expect(appendStyles(null)).toBeUndefined();
		expect(appendStyles(undefined)).toBeUndefined();
	});

	test('assigns id when provided', () => {
		const style = appendStyles('.a { color: red; }', 'my-style');

		expect(style.id).toBe('my-style');
	});

	test('updates existing element when id matches', () => {
		const style1 = appendStyles('.a { color: red; }', 'reusable');
		const style2 = appendStyles('.a { color: blue; }', 'reusable');

		expect(style1).toBe(style2);
		expect(style2.innerHTML).toContain('color: blue');
		expect(document.querySelectorAll('#reusable').length).toBe(1);
	});

	test('creates separate elements without id', () => {
		appendStyles('.a { color: red; }');
		appendStyles('.b { color: blue; }');

		expect(document.head.querySelectorAll('style').length).toBe(2);
	});
});
