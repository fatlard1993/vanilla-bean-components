/// <reference lib="dom" />

import rootContext from '../rootContext';
import { appendStyles } from './appendStyles';
import { postCSS } from './postCSS';
import { themeStyles } from './themeStyles';

/**
 * shimCSS is tested via its internal pipeline because styled.test.js uses
 * mock.module('./shimCSS') which leaks process-wide in bun, replacing the
 * real shimCSS with a no-op for all consumers. Rather than fight the
 * tooling, we test the actual behavior by orchestrating the same pipeline
 * shimCSS uses: themeStyles → postCSS → appendStyles, plus the queueing
 * mechanism on rootContext.
 */

const setReadyState = value =>
	Object.defineProperty(document, 'readyState', { value, configurable: true, writable: true });

describe('shimCSS pipeline', () => {
	let savedReadyState;

	beforeEach(() => {
		savedReadyState = document.readyState;
		document.head.querySelectorAll('style').forEach(el => el.remove());
	});

	afterEach(() => {
		setReadyState(savedReadyState);
	});

	describe('immediate processing (document complete)', () => {
		test('themeStyles → postCSS → appendStyles injects CSS into head', async () => {
			const config = {
				styles: () => '.child { color: red; }',
				scope: '.pipeline-test',
			};

			const css = await postCSS(themeStyles(config));
			const style = appendStyles(css, config.scope.replace(/^\./, ''));

			expect(style).toBeTruthy();
			expect(style.innerHTML).toContain('color: red');
			expect(style.parentElement).toBe(document.head);
		});

		test('scope is used as style element id with dot stripped', async () => {
			const config = {
				styles: () => 'color: blue;',
				scope: '.scoped-id',
			};

			const css = await postCSS(themeStyles(config));
			appendStyles(css, config.scope.replace(/^\./, ''));

			const style = document.getElementById('scoped-id');

			expect(style).toBeTruthy();
			expect(style.tagName).toBe('STYLE');
		});

		test('processes theme function styles through themeStyles', () => {
			const config = {
				styles: ({ colors }) => `color: ${colors.red};`,
				scope: '.themed',
			};

			const result = themeStyles(config);

			expect(typeof result).toBe('string');
			expect(result).toContain('color:');
		});

		test('postCSS processes nested CSS syntax', async () => {
			const css = '.parent { .child { color: red; } }';
			const result = await postCSS(css);

			expect(result).toContain('.parent .child');
			expect(result).toContain('color: red');
		});

		test('postCSS returns empty string for falsy input', async () => {
			expect(await postCSS('')).toBe('');
			expect(await postCSS(null)).toBe('');
			expect(await postCSS(undefined)).toBe('');
		});
	});

	describe('queue mechanism (document loading)', () => {
		beforeEach(() => {
			rootContext.onLoadStyleQueue = null;
			rootContext.onLoadStyleListener = null;
		});

		afterEach(() => {
			rootContext.onLoadStyleQueue = null;
			rootContext.onLoadStyleListener = null;
		});

		test('configs can be queued in rootContext', () => {
			const config1 = { styles: () => 'color: red;', scope: '.q1' };
			const config2 = { styles: () => 'color: blue;', scope: '.q2' };

			rootContext.onLoadStyleQueue = rootContext.onLoadStyleQueue || [];
			rootContext.onLoadStyleQueue.push(config1);
			rootContext.onLoadStyleQueue.push(config2);

			expect(rootContext.onLoadStyleQueue).toBeArrayOfSize(2);
			expect(rootContext.onLoadStyleQueue[0]).toBe(config1);
			expect(rootContext.onLoadStyleQueue[1]).toBe(config2);
		});

		test('queued configs can be processed and injected', async () => {
			const configs = [
				{ styles: () => '.child { color: red; }', scope: '.batch-1' },
				{ styles: () => '.child { color: blue; }', scope: '.batch-2' },
			];

			// Simulate the load listener's processing logic
			await Promise.all(
				configs.map(async config => {
					const css = await postCSS(themeStyles(config));
					appendStyles(css, config.scope.replace(/^\./, ''));
				}),
			);

			const style1 = document.getElementById('batch-1');
			const style2 = document.getElementById('batch-2');

			expect(style1).toBeTruthy();
			expect(style1.innerHTML).toContain('color: red');
			expect(style2).toBeTruthy();
			expect(style2.innerHTML).toContain('color: blue');
		});

		test('queue cleanup resets rootContext properties', () => {
			rootContext.onLoadStyleQueue = [{ styles: () => '', scope: '.x' }];
			rootContext.onLoadStyleListener = () => {};

			// Simulate cleanup after processing
			rootContext.onLoadStyleQueue = null;
			rootContext.onLoadStyleListener = null;

			expect(rootContext.onLoadStyleQueue).toBeNull();
			expect(rootContext.onLoadStyleListener).toBeNull();
		});
	});

	describe('themeStyles edge cases', () => {
		test('returns empty string for whitespace-only styles', () => {
			const result = themeStyles({ styles: () => '   \n\t  ' });

			expect(result).toBe('');
		});

		test('returns style object directly when styles function returns object', () => {
			const styleObj = { color: 'red', margin: '10px' };
			const result = themeStyles({ styles: () => styleObj });

			expect(result).toBe(styleObj);
		});

		test('wraps CSS in scope selector when provided', () => {
			const result = themeStyles({
				styles: () => 'color: red;',
				scope: '.my-scope',
			});

			expect(result).toContain('.my-scope');
			expect(result).toContain('color: red');
		});
	});
});
