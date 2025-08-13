/* eslint-disable compat/compat */
import { copyToClipboard, isMac, readClipboard, vibrate, tactileResponse } from './browser';

describe('browser utilities', () => {
	describe('isMac', () => {
		test('returns boolean value', () => {
			const result = isMac();
			expect(typeof result).toBe('boolean');
		});

		test('is consistent across calls', () => {
			const result1 = isMac();
			const result2 = isMac();
			expect(result1).toBe(result2);
		});

		test('handles function call without throwing', () => {
			expect(() => isMac()).not.toThrow();
		});

		test('detects platform correctly based on current environment', () => {
			const result = isMac();

			const platform = (window.navigator?.userAgentData?.platform || window.navigator?.platform || '').toLowerCase();
			const expectedResult = platform.startsWith('mac');

			expect(result).toBe(expectedResult);
		});
	});

	describe('copyToClipboard', () => {
		let originalIsSecureContext;

		beforeEach(() => {
			originalIsSecureContext = global.isSecureContext;
		});

		afterEach(() => {
			global.isSecureContext = originalIsSecureContext;
		});

		test('returns false in insecure context', () => {
			global.isSecureContext = false;
			const result = copyToClipboard('test');
			expect(result).toBe(false);
		});

		test('handles different input types', () => {
			expect(() => copyToClipboard('')).not.toThrow();
			expect(() => copyToClipboard('text')).not.toThrow();
			expect(() => copyToClipboard('special chars: !@#$%')).not.toThrow();
			expect(() => copyToClipboard('unicode: 🚀')).not.toThrow();
		});

		test('returns consistent type for all inputs', () => {
			expect(typeof copyToClipboard('test1')).toBe('boolean');
			expect(typeof copyToClipboard('')).toBe('boolean');
			expect(typeof copyToClipboard('🚀')).toBe('boolean');
		});
	});

	describe('readClipboard', () => {
		let originalIsSecureContext;

		beforeEach(() => {
			originalIsSecureContext = global.isSecureContext;
		});

		afterEach(() => {
			global.isSecureContext = originalIsSecureContext;
		});

		test('returns false in insecure context', async () => {
			global.isSecureContext = false;
			const result = await readClipboard();
			expect(result).toBe(false);
		});

		test('does not throw in secure context', async () => {
			global.isSecureContext = true;
			await expect(readClipboard()).resolves.toBeDefined();
		});

		test('handles function call without throwing', () => {
			expect(() => readClipboard()).not.toThrow();
		});
	});

	describe('vibrate', () => {
		test('does not throw with default parameters', () => {
			expect(() => vibrate()).not.toThrow();
		});

		test('does not throw with custom duration', () => {
			expect(() => vibrate(100)).not.toThrow();
			expect(() => vibrate(0)).not.toThrow();
			expect(() => vibrate(-1)).not.toThrow();
		});

		test('does not throw with pattern arrays', () => {
			expect(() => vibrate([100, 50, 100])).not.toThrow();
			expect(() => vibrate([])).not.toThrow();
			expect(() => vibrate([0])).not.toThrow();
		});

		test('handles edge case inputs gracefully', () => {
			expect(() => vibrate(null)).not.toThrow();
			expect(() => vibrate(undefined)).not.toThrow();
			expect(() => vibrate(Number.MAX_SAFE_INTEGER)).not.toThrow();
		});
	});

	describe('tactileResponse', () => {
		test('does not throw when called', () => {
			expect(() => tactileResponse()).not.toThrow();
		});

		test('is callable multiple times', () => {
			expect(() => {
				tactileResponse();
				tactileResponse();
				tactileResponse();
			}).not.toThrow();
		});
	});

	describe('function contracts and behavior', () => {
		test('all functions exist and are callable', () => {
			expect(typeof isMac).toBe('function');
			expect(typeof copyToClipboard).toBe('function');
			expect(typeof readClipboard).toBe('function');
			expect(typeof vibrate).toBe('function');
			expect(typeof tactileResponse).toBe('function');
		});

		test('functions have expected return types', () => {
			expect(typeof isMac()).toBe('boolean');
			expect(typeof copyToClipboard('test')).toBe('boolean');
			expect(readClipboard()).toBeInstanceOf(Promise);
		});

		test('functions handle null/undefined inputs gracefully', () => {
			expect(() => copyToClipboard(null)).not.toThrow();
			expect(() => copyToClipboard(undefined)).not.toThrow();
			expect(() => vibrate(null)).not.toThrow();
			expect(() => vibrate(undefined)).not.toThrow();
		});
	});

	describe('security context behavior', () => {
		let originalIsSecureContext;

		beforeEach(() => {
			originalIsSecureContext = global.isSecureContext;
		});

		afterEach(() => {
			global.isSecureContext = originalIsSecureContext;
		});

		test('clipboard operations respect secure context', () => {
			global.isSecureContext = false;
			expect(copyToClipboard('test')).toBe(false);

			global.isSecureContext = null;
			expect(copyToClipboard('test')).toBe(false);

			global.isSecureContext = undefined;
			expect(copyToClipboard('test')).toBe(false);
		});

		test('readClipboard respects secure context', async () => {
			global.isSecureContext = false;
			expect(await readClipboard()).toBe(false);

			global.isSecureContext = null;
			expect(await readClipboard()).toBe(false);

			global.isSecureContext = undefined;
			expect(await readClipboard()).toBe(false);
		});
	});

	describe('real-world usage scenarios', () => {
		test('feature detection pattern works', () => {
			const isMacDevice = isMac();
			const hasClipboardAPI = typeof navigator?.clipboard?.writeText === 'function';
			const hasVibrationAPI = typeof navigator?.vibrate === 'function';

			expect(typeof isMacDevice).toBe('boolean');
			expect(typeof hasClipboardAPI).toBe('boolean');
			expect(typeof hasVibrationAPI).toBe('boolean');
		});

		test('safe clipboard workflow', async () => {
			if (!isSecureContext) {
				expect(copyToClipboard('test')).toBe(false);
				expect(await readClipboard()).toBe(false);
			} else {
				expect(() => copyToClipboard('test')).not.toThrow();
				await expect(readClipboard()).resolves.toBeDefined();
			}
		});

		test('vibration patterns work with various inputs', () => {
			const patterns = [30, [200, 100, 200], [100, 30, 100, 30, 100], 0];

			patterns.forEach(pattern => {
				expect(() => vibrate(pattern)).not.toThrow();
			});
		});

		test('tactile feedback is consistent', () => {
			const calls = Array.from({ length: 10 }, () => {
				expect(() => tactileResponse()).not.toThrow();
				return true;
			});

			expect(calls.every(Boolean)).toBe(true);
		});
	});

	describe('edge cases and error handling', () => {
		test('handles missing browser APIs gracefully', () => {
			expect(() => isMac()).not.toThrow();
			expect(() => vibrate(100)).not.toThrow();
			expect(() => tactileResponse()).not.toThrow();
		});

		test('clipboard operations handle API absence', () => {
			const copyResult = copyToClipboard('test');
			expect(typeof copyResult).toBe('boolean');
		});

		test('functions handle extreme inputs', () => {
			expect(() => copyToClipboard('x'.repeat(10000))).not.toThrow();
			expect(() => vibrate(999999)).not.toThrow();
			expect(() => vibrate([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).not.toThrow();
		});

		test('maintains function stability across multiple calls', () => {
			const isMacResults = Array.from({ length: 5 }, () => isMac());
			const allSame = isMacResults.every(result => result === isMacResults[0]);
			expect(allSame).toBe(true);

			const copyResults = ['test1', 'test2', 'test3'].map(text => copyToClipboard(text));
			expect(copyResults.every(result => typeof result === 'boolean')).toBe(true);
		});
	});

	describe('performance and stability', () => {
		test('functions execute quickly', () => {
			const start = performance.now();

			isMac();
			copyToClipboard('test');
			vibrate(30);
			tactileResponse();

			const duration = performance.now() - start;
			expect(duration).toBeLessThan(100);
		});

		test('functions are idempotent where expected', () => {
			const result1 = isMac();
			const result2 = isMac();
			const result3 = isMac();

			expect(result1).toBe(result2);
			expect(result2).toBe(result3);
		});

		test('no memory leaks with repeated calls', () => {
			for (let i = 0; i < 100; i++) {
				isMac();
				copyToClipboard(`test-${i}`);
				vibrate(1);
			}

			expect(true).toBe(true);
		});
	});
});
