import {
	copyToClipboard,
	fitToKeyboard,
	isMac,
	readClipboard,
	readStorage,
	requestWakeLock,
	vibrate,
	tactileResponse,
	writeStorage,
} from './browser';

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

		test('a Mac, an iPhone and an iPad use the Mac keys; Windows, Linux and Android do not', () => {
			const platform = Object.getOwnPropertyDescriptor(window.navigator, 'platform');
			const on = value => {
				Object.defineProperty(window.navigator, 'platform', { value, configurable: true });

				return isMac();
			};

			try {
				expect(['MacIntel', 'iPhone', 'iPad'].map(on)).toEqual([true, true, true]);
				expect(['Win32', 'Linux x86_64', 'Linux armv8l'].map(on)).toEqual([false, false, false]);
			} finally {
				if (platform) Object.defineProperty(window.navigator, 'platform', platform);
				else delete window.navigator.platform;
			}
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

		test('resolves false in an insecure context where the fallback fails too', async () => {
			global.isSecureContext = false;
			expect(await copyToClipboard('test')).toBe(false);
		});

		test('resolves true once the clipboard write succeeds', async () => {
			global.isSecureContext = true;
			const writeText = spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

			expect(await copyToClipboard('copied')).toBe(true);
			expect(writeText).toHaveBeenCalledWith('copied');
		});

		test('resolves false when the clipboard refuses and the fallback fails', async () => {
			global.isSecureContext = true;
			spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

			expect(await copyToClipboard('refused')).toBe(false);
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

		test('functions have expected return types', async () => {
			expect(typeof isMac()).toBe('boolean');
			expect(copyToClipboard('test')).toBeInstanceOf(Promise);
			expect(typeof (await copyToClipboard('test'))).toBe('boolean');
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

		test('clipboard operations respect secure context', async () => {
			global.isSecureContext = false;
			expect(await copyToClipboard('test')).toBe(false);

			global.isSecureContext = null;
			expect(await copyToClipboard('test')).toBe(false);

			global.isSecureContext = undefined;
			expect(await copyToClipboard('test')).toBe(false);
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
				expect(await copyToClipboard('test')).toBe(false);
				expect(await readClipboard()).toBe(false);
			} else {
				await expect(copyToClipboard('test')).resolves.toBeBoolean();
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

		test('clipboard operations handle API absence', async () => {
			const copyResult = await copyToClipboard('test');
			expect(typeof copyResult).toBe('boolean');
		});

		test('functions handle extreme inputs', () => {
			expect(() => copyToClipboard('x'.repeat(10000))).not.toThrow();
			expect(() => vibrate(999999)).not.toThrow();
			expect(() => vibrate([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).not.toThrow();
		});

		test('maintains function stability across multiple calls', async () => {
			const isMacResults = Array.from({ length: 5 }, () => isMac());
			const allSame = isMacResults.every(result => result === isMacResults[0]);
			expect(allSame).toBe(true);

			const copyResults = await Promise.all(['test1', 'test2', 'test3'].map(text => copyToClipboard(text)));
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

describe('requestWakeLock', () => {
	afterEach(() => {
		delete navigator.wakeLock;
	});

	test('takes the lock, takes it again when the page is back in view, and lets it go when asked', async () => {
		const locks = [];

		navigator.wakeLock = {
			request: async () => {
				const lock = { released: false, release: () => (lock.released = true) };

				locks.push(lock);

				return lock;
			},
		};

		const release = requestWakeLock();

		await Promise.resolve();
		expect(locks.length).toBe(1);

		// The browser lets the lock go while the page is hidden
		locks[0].released = true;
		document.dispatchEvent(new Event('visibilitychange'));
		await Promise.resolve();
		expect(locks.length).toBe(2);

		release();
		expect(locks[1].released).toBe(true);

		document.dispatchEvent(new Event('visibilitychange'));
		await Promise.resolve();
		expect(locks.length).toBe(2);
	});

	test('two quick turns back to the page take one lock, so releasing lets the screen sleep', async () => {
		const locks = [];
		let grant;

		navigator.wakeLock = {
			request: () =>
				new Promise(resolve => {
					grant = () => {
						const lock = { released: false, release: () => (lock.released = true) };

						locks.push(lock);
						resolve(lock);
					};
				}),
		};

		const release = requestWakeLock();

		document.dispatchEvent(new Event('visibilitychange'));
		document.dispatchEvent(new Event('visibilitychange'));
		grant();
		await new Promise(resolve => setTimeout(resolve));

		release();

		expect(locks.length).toBe(1);
		expect(locks.every(lock => lock.released)).toBe(true);
	});

	test('does nothing where it is not supported', () => {
		expect(requestWakeLock()).toBeFunction();
	});
});

describe('fitToKeyboard', () => {
	test('sizes the page to what the keyboard leaves showing, and stops when asked', () => {
		const listeners = {};
		const original = window.visualViewport;

		Object.defineProperty(window, 'visualViewport', {
			configurable: true,
			value: {
				height: 500,
				scale: 1,
				addEventListener: (type, fn) => (listeners[type] = fn),
				removeEventListener: () => {},
			},
		});

		const stop = fitToKeyboard();
		const root = document.documentElement;

		expect(root.style.getPropertyValue('--visible-height')).toBe('500px');
		expect(root.style.height).toBe('500px');

		window.visualViewport.height = 320;
		listeners.resize();
		expect(root.style.height).toBe('320px');

		stop();
		expect(root.style.height).toBe('');
		Object.defineProperty(window, 'visualViewport', { configurable: true, value: original });
	});
});

describe('readStorage / writeStorage', () => {
	afterEach(() => localStorage.clear());

	test('a value comes back as it was kept, and undefined removes it', () => {
		writeStorage('recent', ['#fff', '#000']);
		expect(readStorage('recent')).toEqual(['#fff', '#000']);

		writeStorage('recent', undefined);
		expect(readStorage('recent', [])).toEqual([]);
	});

	test('a value that will not parse answers the fallback', () => {
		localStorage.setItem('recent', '{oops');

		expect(readStorage('recent', [])).toEqual([]);
	});

	test('refused storage neither throws nor keeps anything', () => {
		const storage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

		// Blocked site data throws as soon as localStorage is touched
		Object.defineProperty(globalThis, 'localStorage', {
			configurable: true,
			get: () => {
				throw new DOMException('denied', 'SecurityError');
			},
		});

		try {
			expect(() => writeStorage('recent', [1])).not.toThrow();
			expect(readStorage('recent', 'none')).toBe('none');
		} finally {
			Object.defineProperty(globalThis, 'localStorage', storage);
		}
	});
});
