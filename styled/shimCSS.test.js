/// <reference lib="dom" />

import rootContext from '../rootContext';
import { shimCSS } from './shimCSS';

describe('shimCSS', () => {
	let originalReadyState;
	let originalRootContextProps;

	beforeEach(() => {
		originalReadyState = document.readyState;
		originalRootContextProps = {
			onLoadStyleQueue: rootContext.onLoadStyleQueue,
			onLoadCSS: rootContext.onLoadCSS,
			onLoadStyleListener: rootContext.onLoadStyleListener,
		};

		rootContext.onLoadStyleQueue = undefined;
		rootContext.onLoadCSS = undefined;
		rootContext.onLoadStyleListener = undefined;

		document.querySelectorAll('style').forEach(style => {
			if (style.innerHTML.includes('.test')) {
				style.remove();
			}
		});
	});

	afterEach(() => {
		Object.defineProperty(document, 'readyState', {
			value: originalReadyState,
			configurable: true,
		});

		Object.keys(originalRootContextProps).forEach(key => {
			if (originalRootContextProps[key] !== undefined) {
				rootContext[key] = originalRootContextProps[key];
			} else {
				delete rootContext[key];
			}
		});
	});

	test('shimCSS function exists and is callable', () => {
		expect(typeof shimCSS).toBe('function');

		expect(() =>
			shimCSS({
				styles: () => 'color: red;',
				scope: '.test',
			}),
		).not.toThrow();
	});

	test('returns undefined regardless of document state', () => {
		Object.defineProperty(document, 'readyState', {
			value: 'loading',
			configurable: true,
		});

		const loadingResult = shimCSS({
			styles: () => 'color: red;',
			scope: '.test-loading',
		});

		expect(loadingResult).toBeUndefined();

		Object.defineProperty(document, 'readyState', {
			value: 'complete',
			configurable: true,
		});

		const completeResult = shimCSS({
			styles: () => 'color: blue;',
			scope: '.test-complete',
		});

		expect(completeResult).toBeUndefined();
	});

	test('handles different document ready states', () => {
		const states = ['loading', 'interactive', 'complete'];

		states.forEach(state => {
			Object.defineProperty(document, 'readyState', {
				value: state,
				configurable: true,
			});

			const result = shimCSS({
				styles: () => `/* ${state} test */`,
				scope: `.test-${state}`,
			});

			expect(result).toBeUndefined();
		});
	});

	test('accepts style configuration objects', () => {
		const validConfigs = [
			{ styles: () => 'color: red;', scope: '.test1' },
			{ styles: () => 'background: blue;' },
			{ scope: '.test2' },
			{},
		];

		validConfigs.forEach(config => {
			expect(() => shimCSS(config)).not.toThrow();
		});
	});

	test('handles theme function styles', () => {
		const themedConfig = {
			styles: ({ colors, fonts }) => `
				color: ${colors.red};
				${fonts.kodeMono}
				background: ${colors.blue};
			`,
			scope: '.themed-test',
		};

		expect(() => shimCSS(themedConfig)).not.toThrow();

		const result = shimCSS(themedConfig);
		expect(result).toBeUndefined();
	});

	test('handles edge cases gracefully', () => {
		expect(() => shimCSS()).not.toThrow();
		expect(() => shimCSS(null)).not.toThrow();
		expect(() => shimCSS(undefined)).not.toThrow();
		expect(() => shimCSS({ styles: null })).not.toThrow();
		expect(() => shimCSS({ styles: undefined })).not.toThrow();
		expect(() => shimCSS({ scope: null })).not.toThrow();
	});

	test('can be called multiple times', () => {
		const configs = [
			{ styles: () => 'color: red;', scope: '.multi1' },
			{ styles: () => 'color: blue;', scope: '.multi2' },
			{ styles: () => 'color: green;', scope: '.multi3' },
		];

		configs.forEach(config => {
			expect(() => shimCSS(config)).not.toThrow();
			expect(shimCSS(config)).toBeUndefined();
		});
	});

	test('does not modify rootContext in current state', () => {
		const initialQueue = rootContext.onLoadStyleQueue;
		const initialListener = rootContext.onLoadStyleListener;

		shimCSS({
			styles: () => 'color: red;',
			scope: '.no-modify-test',
		});

		expect(rootContext.onLoadStyleQueue).toBe(initialQueue);
		expect(rootContext.onLoadStyleListener).toBe(initialListener);
	});
});
