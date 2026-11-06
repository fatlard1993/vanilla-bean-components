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

		test("reads the clipboard's text in a secure context", async () => {
			global.isSecureContext = true;
			spyOn(navigator.clipboard, 'readText').mockResolvedValue('pasted');

			expect(await readClipboard()).toBe('pasted');
		});

		test('answers false when the clipboard refuses', async () => {
			global.isSecureContext = true;
			spyOn(navigator.clipboard, 'readText').mockRejectedValue(new Error('denied'));

			expect(await readClipboard()).toBe(false);
		});
	});

	describe('vibrate', () => {
		afterEach(() => {
			delete navigator.vibrate;
		});

		test('hands the device the duration or the pattern, a short burst by default', () => {
			navigator.vibrate = mock();

			vibrate();
			vibrate(100);
			vibrate([100, 50, 100]);
			tactileResponse();

			expect(navigator.vibrate.mock.calls.map(([pattern]) => pattern)).toEqual([30, 100, [100, 50, 100], 30]);
		});

		test('does nothing on a device that cannot vibrate', () => {
			delete navigator.vibrate;

			expect(() => vibrate(100)).not.toThrow();
		});
	});

	describe('the copy fallback', () => {
		let originalIsSecureContext;

		beforeEach(() => {
			originalIsSecureContext = global.isSecureContext;
		});

		afterEach(() => {
			global.isSecureContext = originalIsSecureContext;
			delete document.execCommand;
		});

		test('copies through a textarea where there is no clipboard API, and leaves nothing behind', async () => {
			global.isSecureContext = false;
			// The command runs with the textarea in the page, holding the text
			document.execCommand = mock(
				command => command === 'copy' && document.querySelector('textarea')?.value === 'fallen back',
			);

			expect(await copyToClipboard('fallen back')).toBe(true);
			expect(document.execCommand).toHaveBeenCalledWith('copy');
			expect(document.querySelectorAll('textarea')).toHaveLength(0);
		});

		test('leaves nothing behind when it fails either', async () => {
			global.isSecureContext = false;

			for (let i = 0; i < 20; i++) expect(await copyToClipboard(`test-${i}`)).toBe(false);

			expect(document.querySelectorAll('textarea')).toHaveLength(0);
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
