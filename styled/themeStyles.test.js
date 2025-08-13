/// <reference lib="dom" />

import theme from '../theme';
import { themeStyles } from './themeStyles';

describe('themeStyles', () => {
	test('processes theme function returning CSS string', () => {
		const styleConfig = {
			styles: ({ colors }) => `color: ${colors.red}; background: ${colors.blue};`,
		};

		const result = themeStyles(styleConfig);

		expect(result).toContain(theme.colors.red.toString());
		expect(result).toContain(theme.colors.blue.toString());
		expect(typeof result).toBe('string');
	});

	test('wraps styles with scope when provided', () => {
		const styleConfig = {
			styles: () => 'color: red; font-size: 16px;',
			scope: '.test-scope',
		};

		const result = themeStyles(styleConfig);

		expect(result).toBe('.test-scope { color: red; font-size: 16px; }');
	});

	test('returns style object directly when function returns object', () => {
		const styleObject = { color: 'red', fontSize: '16px' };
		const styleConfig = {
			styles: () => styleObject,
		};

		const result = themeStyles(styleConfig);

		expect(result).toBe(styleObject);
		expect(typeof result).toBe('object');
	});

	test('applies scope to object-returned styles', () => {
		const styleObject = { color: 'blue', padding: '8px' };
		const styleConfig = {
			styles: () => styleObject,
			scope: '.scoped',
		};

		const result = themeStyles(styleConfig);

		expect(result).toBe(styleObject);
	});

	test('returns empty string for empty styles', () => {
		expect(themeStyles({ styles: () => '' })).toBe('');
		expect(themeStyles({ styles: () => '   ' })).toBe('');
		expect(themeStyles({ styles: () => '\n\t ' })).toBe('');
		expect(themeStyles({ styles: () => '\r\n  \t  ' })).toBe('');
	});

	test('passes complete theme object to styles function', () => {
		let receivedTheme;
		const styleConfig = {
			styles: themeObj => {
				receivedTheme = themeObj;
				return 'color: red;';
			},
		};

		themeStyles(styleConfig);

		expect(receivedTheme).toBe(theme);
		expect(receivedTheme).toHaveProperty('colors');
		expect(receivedTheme).toHaveProperty('fonts');
		expect(receivedTheme).toHaveProperty('button');
		expect(receivedTheme).toHaveProperty('input');
	});

	test('handles complex theme function usage', () => {
		const styleConfig = {
			styles: ({ colors, fonts, button }) => `
				${button}
				${fonts.kodeMono}
				color: ${colors.mostReadable(colors.blue, [colors.white, colors.black])};
				background: ${colors.darker(colors.blue)};
			`,
		};

		const result = themeStyles(styleConfig);

		expect(result).toContain('display: inline-block');
		expect(result).toContain('font-family');
		expect(typeof result).toBe('string');
		expect(result.length).toBeGreaterThan(0);
	});

	test('handles default empty styles function', () => {
		const result = themeStyles({ styles: undefined });
		expect(result).toBe('');
	});

	test('removes excess indentation in development mode', () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'development';

		const styleConfig = {
			styles: () => `
				color: red;
				background: blue;
			`,
			scope: '.test',
		};

		const result = themeStyles(styleConfig);

		expect(result).toContain('.test');
		expect(result).toContain('color: red');
		expect(result).toContain('background: blue');

		process.env.NODE_ENV = originalEnv;
	});

	test('preserves indentation in production mode', () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'production';

		const styleConfig = {
			styles: () => `
				color: red;
				background: blue;
			`,
			scope: '.test',
		};

		const result = themeStyles(styleConfig);

		expect(result).toContain('.test');
		expect(result).toContain('color: red');

		process.env.NODE_ENV = originalEnv;
	});

	test('handles whitespace-only strings correctly', () => {
		const testCases = [
			{ input: '', expected: '' },
			{ input: ' ', expected: '' },
			{ input: '\n', expected: '' },
			{ input: '\t', expected: '' },
			{ input: '\r', expected: '' },
			{ input: '  \n\t  ', expected: '' },
			{ input: 'color:red;', expected: 'color:red;' },
		];

		testCases.forEach(({ input, expected }) => {
			const result = themeStyles({ styles: () => input });
			expect(result).toBe(expected);
		});
	});
});
