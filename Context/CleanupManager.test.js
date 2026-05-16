import CleanupManager from './CleanupManager';

describe('CleanupManager', () => {
	let manager;

	beforeEach(() => {
		manager = new CleanupManager();
	});

	afterEach(() => {
		if (!manager.isDestroyed) manager.destroy();
	});

	describe('add', () => {
		test('registers cleanup tasks', () => {
			manager.add(() => {}, 'task 1');
			manager.add(() => {}, 'task 2');

			expect(manager.size).toBe(2);
		});

		test('returns deregister function', () => {
			const deregister = manager.add(() => {}, 'removable');

			expect(manager.size).toBe(1);

			deregister();

			expect(manager.size).toBe(0);
		});

		test('deregister is idempotent', () => {
			const deregister = manager.add(() => {}, 'once');
			manager.add(() => {}, 'other');

			deregister();
			deregister();

			expect(manager.size).toBe(1);
		});

		test('returns no-op when destroyed', () => {
			manager.destroy();

			const deregister = manager.add(() => {}, 'late');

			expect(manager.size).toBe(0);
			expect(typeof deregister).toBe('function');
			deregister(); // should not throw
		});
	});

	describe('destroy', () => {
		test('executes all cleanup tasks', () => {
			const fn1 = mock();
			const fn2 = mock();

			manager.add(fn1, 'first');
			manager.add(fn2, 'second');

			manager.destroy();

			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledTimes(1);
		});

		test('clears tasks after execution', () => {
			manager.add(() => {}, 'task');
			manager.destroy();

			expect(manager.size).toBe(0);
		});

		test('marks as destroyed', () => {
			expect(manager.isDestroyed).toBe(false);

			manager.destroy();

			expect(manager.isDestroyed).toBe(true);
		});

		test('is idempotent', () => {
			const fn = mock();
			manager.add(fn);

			manager.destroy();
			manager.destroy();

			expect(fn).toHaveBeenCalledTimes(1);
		});

		test('isolates errors between cleanup tasks', () => {
			const fn1 = mock();
			const fn2 = mock(() => {
				throw new Error('boom');
			});
			const fn3 = mock();

			manager.add(fn1, 'first');
			manager.add(fn2, 'failing');
			manager.add(fn3, 'third');

			expect(() => manager.destroy()).not.toThrow();

			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledTimes(1);
			expect(fn3).toHaveBeenCalledTimes(1);
		});
	});

	describe('size', () => {
		test('tracks registered count', () => {
			expect(manager.size).toBe(0);

			const d1 = manager.add(() => {});
			expect(manager.size).toBe(1);

			manager.add(() => {});
			expect(manager.size).toBe(2);

			d1();
			expect(manager.size).toBe(1);
		});
	});
});
