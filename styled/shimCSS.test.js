/// <reference lib="dom" />

import { appendStyles } from './appendStyles';
import { themeStyles } from './themeStyles';

/**
 * shimCSS is tested via its internal pipeline because styled.test.js uses
 * mock.module('./shimCSS') which leaks process-wide in bun, replacing the
 * real shimCSS with a no-op for all consumers. Rather than fight the
 * tooling, we test the actual behavior by orchestrating the same pipeline
 * shimCSS uses: themeStyles → appendStyles.
 */

describe('shimCSS pipeline', () => {
	beforeEach(() => {
		document.head.querySelectorAll('style').forEach(el => el.remove());
	});

	describe('immediate processing (document complete)', () => {
		test('themeStyles → appendStyles injects CSS into head', () => {
			const config = {
				styles: () => '.child { color: red; }',
				scope: '.pipeline-test',
			};

			const style = appendStyles(themeStyles(config) || '', config.scope.replace(/^\./, ''));

			expect(style).toBeTruthy();
			expect(style.innerHTML).toContain('color: red');
			expect(style.parentElement).toBe(document.head);
		});

		test('scope is used as style element id with dot stripped', () => {
			const config = {
				styles: () => 'color: blue;',
				scope: '.scoped-id',
			};

			appendStyles(themeStyles(config) || '', config.scope.replace(/^\./, ''));

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
	});

	describe('batch processing', () => {
		test('multiple configs can be processed and injected', () => {
			const configs = [
				{ styles: () => '.child { color: red; }', scope: '.batch-1' },
				{ styles: () => '.child { color: blue; }', scope: '.batch-2' },
			];

			configs.forEach(config => appendStyles(themeStyles(config) || '', config.scope.replace(/^\./, '')));

			const style1 = document.getElementById('batch-1');
			const style2 = document.getElementById('batch-2');

			expect(style1).toBeTruthy();
			expect(style1.innerHTML).toContain('color: red');
			expect(style2).toBeTruthy();
			expect(style2.innerHTML).toContain('color: blue');
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
