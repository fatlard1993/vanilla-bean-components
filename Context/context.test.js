import Context from './Context';

describe('Context', () => {
	let context;

	beforeEach(() => {
		context = new Context({ x: 'hello', y: 42, z: [1, 2, 3] });
	});

	afterEach(() => {
		context?.destroy();
	});

	describe('initialization', () => {
		test('initializes with valid plain object', () => {
			expect(context.x).toBe('hello');
			expect(context.y).toBe(42);
			expect(context.z).toEqual([1, 2, 3]);
		});

		test('rejects invalid initial states', () => {
			expect(() => new Context(null)).toThrow('Context requires a plain object as initial state');
			expect(() => new Context('string')).toThrow();
			expect(() => new Context([1, 2, 3])).toThrow();
		});

		test('handles subscriber properties in initial state', () => {
			const sourceContext = new Context({ value: 10 });
			const derivedContext = new Context({
				doubled: sourceContext.subscriber('value', v => v * 2),
			});

			expect(derivedContext.doubled).toBe(20);

			sourceContext.value = 5;
			expect(derivedContext.doubled).toBe(10);

			derivedContext.destroy();
			sourceContext.destroy();
		});
	});

	describe('reactivity system', () => {
		test('emits events on property changes', () => {
			const setHandler = mock();
			const xHandler = mock();

			context.addEventListener('set', setHandler);
			context.addEventListener('x', xHandler);

			context.x = 'world';

			expect(setHandler).toHaveBeenCalledWith(expect.objectContaining({ detail: { key: 'x', value: 'world' } }));
			expect(xHandler).toHaveBeenCalledWith(expect.objectContaining({ detail: 'world' }));
		});

		test('handles complex property assignments', () => {
			context.x = null;
			expect(context.x).toBe(null);

			context.complex = { nested: { value: 42 } };
			expect(context.complex.nested.value).toBe(42);
		});
	});

	describe('subscription system', () => {
		test('manages manual subscriptions', () => {
			const callback = mock();
			const parser = mock(value => value.toUpperCase());

			const { unsubscribe, current, id } = context.subscribe({
				key: 'x',
				callback,
				parser,
			});

			expect(current).toBe('HELLO');
			expect(typeof id).toBe('string');
			expect(parser).toHaveBeenCalledWith('hello');

			context.x = 'world';
			expect(callback).toHaveBeenCalledWith('WORLD');

			unsubscribe();
			context.x = 'again';
			expect(callback).toHaveBeenCalledTimes(1);
		});

		test('validates subscription parameters', () => {
			expect(() => context.subscribe({ key: 'x' })).toThrow('Subscribe callback must be a function');
			expect(() => context.subscribe({ callback: () => {} })).toThrow('Subscribe key must be a string');
			expect(() => context.subscribe({ key: 'x', callback: () => {}, parser: 'invalid' })).toThrow(
				'Subscribe parser must be a function',
			);
		});

		test('handles parser errors gracefully', () => {
			const callback = mock();
			const parser = mock(() => {
				throw new Error('Parser failed');
			});

			const { current } = context.subscribe({ key: 'x', callback, parser });
			expect(current).toBe(null);

			context.x = 'world';
			expect(callback).toHaveBeenCalledWith(null);
		});
	});

	describe('subscriber creation', () => {
		test('creates reactive subscribers', () => {
			const subscriber = context.subscriber('x');
			expect(subscriber.__isSubscriber).toBe(true);
			expect(subscriber.toString()).toBe('hello');

			context.x = 'world';
			expect(subscriber.toString()).toBe('world');
		});

		test('applies parser functions', () => {
			const upperSubscriber = context.subscriber('x', value => value.toUpperCase());
			expect(upperSubscriber.toString()).toBe('HELLO');

			context.x = 'world';
			expect(upperSubscriber.toString()).toBe('WORLD');
		});

		test('subscription to non-existent keys', () => {
			const callback = mock();
			const { current } = context.subscribe({
				key: 'nonExistent',
				callback,
			});

			expect(current).toBe(undefined);
			context.nonExistent = 'now exists';
			expect(callback).toHaveBeenCalledWith('now exists');
		});

		test('handles subscriber creation errors', () => {
			const errorSubscriber = context.subscriber('x', () => {
				throw new Error('Failed');
			});
			expect(errorSubscriber.__isSubscriber).toBe(true);
			expect(errorSubscriber.length).toBe(null);
		});
	});

	describe('resource management', () => {
		test('tracks and cleans up all resources', () => {
			const handler = mock();
			const callback = mock();

			context.addEventListener('x', handler);
			context.subscribe({ key: 'x', callback });

			expect(Object.keys(context.subscriptions).length).toBe(1);
			expect(context.cleanup.size).toBeGreaterThan(0);

			context.destroy();

			expect(context.isDestroyed).toBe(true);
			expect(Object.keys(context.subscriptions).length).toBe(0);
			expect(context.cleanup.size).toBe(0);
		});

		test('handles operations on destroyed context gracefully', () => {
			context.destroy();

			expect(context.subscriber('x')).toBe(null);

			const { current, id } = context.subscribe({
				key: 'x',
				callback: () => {},
			});
			expect(current).toBe('hello');
			expect(id).toBe(null);
		});

		test('supports Symbol.dispose', () => {
			const freshContext = new Context({ test: 1 });
			freshContext[Symbol.dispose]();
			expect(freshContext.isDestroyed).toBe(true);
		});
	});
});
