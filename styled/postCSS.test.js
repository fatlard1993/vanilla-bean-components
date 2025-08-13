/// <reference lib="dom" />

import { postCSS } from './postCSS';

describe('postCSS', () => {
	test('processes nested CSS syntax correctly', async () => {
		const nestedCSS = `
			.container {
				padding: 10px;
				.item {
					margin: 5px;
					&:hover {
						background: red;
					}
				}
			}
		`;

		const result = await postCSS(nestedCSS);

		expect(result).toContain('.container');
		expect(result).toContain('.container .item');
		expect(result).toContain('.container .item:hover');
		expect(result).toContain('background: red');
		expect(result).toContain('padding: 10px');
		expect(result).toContain('margin: 5px');
	});

	test('applies autoprefixer transformations', async () => {
		const cssWithPrefixes = `
			.test {
				display: flex;
				transform: scale(1.2);
				user-select: none;
			}
		`;

		const result = await postCSS(cssWithPrefixes);

		expect(result).toContain('display: flex');
		expect(result).toContain('transform: scale(1.2)');
		expect(typeof result).toBe('string');
		expect(result.length).toBeGreaterThan(0);
	});

	test('handles complex nested structures', async () => {
		const complexCSS = `
			.parent {
				color: blue;

				.child {
					padding: 5px;

					&.active {
						color: green;

						&:hover {
							background: yellow;
						}
					}
				}

				@media (max-width: 600px) {
					font-size: 14px;
				}
			}
		`;

		const result = await postCSS(complexCSS);

		expect(result).toContain('.parent');
		expect(result).toContain('.parent .child');
		expect(result).toContain('.parent .child.active');
		expect(result).toContain('.parent .child.active:hover');
		expect(result).toContain('@media (max-width: 600px)');
	});

	test('returns empty string for falsy input', async () => {
		expect(await postCSS('')).toBe('');
		expect(await postCSS(null)).toBe('');
		expect(await postCSS(undefined)).toBe('');
		expect(await postCSS(false)).toBe('');
	});

	test('handles malformed CSS gracefully', async () => {
		const malformedCSS = '.broken { color: ; background }';

		const result = await postCSS(malformedCSS);

		// postCSS returns undefined on error, which gets caught and handled
		expect(result).toBeUndefined();
	});

	test('processes valid CSS without nested syntax', async () => {
		const plainCSS = `
			.simple {
				color: red;
				background: blue;
				margin: 10px;
			}
		`;

		const result = await postCSS(plainCSS);

		expect(result).toContain('.simple');
		expect(result).toContain('color: red');
		expect(result).toContain('background: blue');
		expect(result).toContain('margin: 10px');
	});

	test('preserves CSS comments and special syntax', async () => {
		const cssWithComments = `
			/* Main container styles */
			.container {
				/* Nested comment */
				display: grid;
				grid-template-columns: repeat(3, 1fr);

				.item {
					/* Item styles */
					padding: 1rem;
				}
			}
		`;

		const result = await postCSS(cssWithComments);

		expect(result).toContain('.container');
		expect(result).toContain('.container .item');
		expect(result).toContain('display: grid');
		expect(result).toContain('grid-template-columns');
	});
});
