// Subscriber.test.js - Focus on Subscriber-specific behavior
import Context from './Context';
import Subscriber from './Subscriber';

describe('Subscriber', () => {
	let context, subscriber;

	beforeEach(() => {
		context = new Context({ value: 'hello', count: 42, items: [1, 2, 3] });
		subscriber = context.subscriber('value');
	});

	afterEach(() => {
		context?.destroy();
	});

	describe('construction', () => {
		test('validates constructor parameters', () => {
			expect(() => new Subscriber({ key: 123, context })).toThrow('Subscriber key must be a string');
			expect(() => new Subscriber({ key: 'value', parser: 'not-function', context })).toThrow(
				'Subscriber parser must be a function',
			);
			expect(() => new Subscriber({ key: 'value', context: null })).toThrow(
				'Subscriber context must be a Context instance',
			);
		});

		test('rejects destroyed context', () => {
			const freshContext = new Context({ test: 1 });
			freshContext.destroy();
			expect(() => new Subscriber({ key: 'test', context: freshContext })).toThrow(
				'Cannot create subscriber on destroyed context',
			);
		});
	});

	describe('value access patterns', () => {
		test('provides transparent access to string values', () => {
			expect(subscriber.toString()).toBe('hello');
			expect(subscriber.length).toBe(5);
			expect(subscriber.slice(0, 2)).toBe('he');
			expect(subscriber.toUpperCase()).toBe('HELLO');
		});

		test('works with array values', () => {
			const arraySubscriber = context.subscriber('items');
			expect(arraySubscriber.length).toBe(3);
			expect(arraySubscriber[0]).toBe(1);
			expect(arraySubscriber.slice(1)).toEqual([2, 3]);
			expect(arraySubscriber.map(x => x * 2)).toEqual([2, 4, 6]);
		});

		test('works with numeric values', () => {
			const numberSubscriber = context.subscriber('count');
			expect(numberSubscriber + 8).toBe(50);
			expect(numberSubscriber.toString()).toBe('42');
		});

		test('updates when context values change', () => {
			context.value = 'world';
			expect(subscriber.toString()).toBe('world');

			const arraySubscriber = context.subscriber('items');
			context.items = [4, 5, 6, 7];
			expect(arraySubscriber.length).toBe(4);
		});
	});

	describe('parser functionality', () => {
		test('applies parser transformations', () => {
			const upperSubscriber = context.subscriber('value', v => v.toUpperCase());
			expect(upperSubscriber.toString()).toBe('HELLO');

			context.value = 'world';
			expect(upperSubscriber.toString()).toBe('WORLD');
		});

		test('handles complex parsing scenarios', () => {
			const evenSubscriber = context.subscriber('items', arr => arr.filter(n => n % 2 === 0));
			expect(evenSubscriber.length).toBe(1);
			expect(evenSubscriber[0]).toBe(2);

			context.items = [2, 4, 6, 8];
			expect(evenSubscriber.length).toBe(4);
		});

		test('handles parser errors gracefully', () => {
			const errorSubscriber = context.subscriber('value', () => {
				throw new Error('Parser failed');
			});
			expect(errorSubscriber.__isSubscriber).toBe(true);
			expect(errorSubscriber.length).toBe(null);
		});
	});

	describe('subscription integration', () => {
		test('integrates with context subscription system', () => {
			const callback = mock();
			const { unsubscribe, current, id } = subscriber.subscribe(callback);

			expect(current).toBe('hello');
			expect(typeof id).toBe('string');

			context.value = 'world';
			expect(callback).toHaveBeenCalledWith('world');

			unsubscribe();
			context.value = 'again';
			expect(callback).toHaveBeenCalledTimes(1);
		});

		test('applies parser in subscriptions', () => {
			const upperSubscriber = context.subscriber('value', v => v.toUpperCase());
			const callback = mock();

			const { current } = upperSubscriber.subscribe(callback);
			expect(current).toBe('HELLO');

			context.value = 'test';
			expect(callback).toHaveBeenCalledWith('TEST');
		});

		test('handles destroyed context subscriptions', () => {
			context.destroy();
			const { current, id } = subscriber.subscribe(() => {});
			expect(current).toBe(null);
			expect(id).toBe(null);
		});
	});

	test('serializes correctly', () => {
		expect(subscriber.toJSON()).toBe('hello');
		expect(JSON.stringify({ user: subscriber })).toBe('{"user":"hello"}');

		context.value = { name: 'John', age: 30 };
		const objSubscriber = context.subscriber('value');
		expect(JSON.stringify({ user: objSubscriber })).toBe('{"user":{"name":"John","age":30}}');
	});
});
