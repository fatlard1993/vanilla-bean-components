import BaseSubscriber from './BaseSubscriber';

class TestSubscriber extends BaseSubscriber {
	constructor(initialValue = 'test') {
		super();
		this.value = initialValue;
		this.proxy = this.createProxy([
			'__isSubscriber',
			'subscribe',
			'unsubscribe',
			'toJSON',
			'setValue',
			'destroy',
			'getCurrentValue',
			'subscriberCallbacks',
			'isDestroyed',
		]);
		return this.proxy;
	}

	getCurrentValue() {
		return this.value;
	}

	setValue(newValue) {
		this.value = newValue;
		this.notifySubscribers(newValue);
	}
}

describe('BaseSubscriber', () => {
	let subscriber;

	beforeEach(() => {
		subscriber = new TestSubscriber('hello');
	});

	afterEach(() => {
		subscriber?.destroy?.();
	});

	describe('proxy behavior', () => {
		test('provides transparent access to current value', () => {
			expect(subscriber.__isSubscriber).toBe(true);
			expect(subscriber.length).toBe(5);
			expect(subscriber.slice(0, 2)).toBe('he');
			expect(subscriber.toUpperCase()).toBe('HELLO');
		});

		test('handles different value types correctly', () => {
			const arraySubscriber = new TestSubscriber([1, 2, 3]);
			expect(arraySubscriber.length).toBe(3);
			expect(arraySubscriber.map(x => x * 2)).toEqual([2, 4, 6]);

			const objectSubscriber = new TestSubscriber({ user: { name: 'John' } });
			expect(objectSubscriber.user.name).toBe('John');

			arraySubscriber.destroy();
			objectSubscriber.destroy();
		});

		test('handles null/undefined values gracefully', () => {
			const nullSubscriber = new TestSubscriber('initial');
			nullSubscriber.setValue(null);
			expect(nullSubscriber.toJSON()).toBe(null);

			const undefinedSubscriber = new TestSubscriber('initial');
			undefinedSubscriber.setValue(undefined);
			expect(undefinedSubscriber.toJSON()).toBe(undefined);

			const mutableSubscriber = new TestSubscriber('test');
			expect(mutableSubscriber.toString()).toBe('test');

			mutableSubscriber.setValue(null);
			expect(mutableSubscriber.toJSON()).toBe(null);

			nullSubscriber.destroy();
			undefinedSubscriber.destroy();
			mutableSubscriber.destroy();
		});
	});

	describe('subscription lifecycle', () => {
		test('manages subscriptions correctly', () => {
			const callback1 = mock();
			const callback2 = mock();

			const { unsubscribe, current } = subscriber.subscribe(callback1);
			expect(current).toBe('hello');

			subscriber.subscribe(callback2);
			expect(subscriber.subscriberCallbacks.size).toBe(2);

			subscriber.setValue('world');
			expect(callback1).toHaveBeenCalledWith('world');
			expect(callback2).toHaveBeenCalledWith('world');

			unsubscribe();
			expect(subscriber.subscriberCallbacks.size).toBe(1);
		});

		test('validates subscription parameters', () => {
			expect(() => subscriber.subscribe()).toThrow();
			expect(() => subscriber.subscribe('not-function')).toThrow();
		});

		test('handles callback errors gracefully', () => {
			const errorCallback = mock(() => {
				throw new Error('Callback error');
			});
			const goodCallback = mock();

			subscriber.subscribe(goodCallback);
			subscriber.subscribe(errorCallback);

			expect(() => subscriber.setValue('update')).not.toThrow();
			expect(goodCallback).toHaveBeenCalledWith('update');
			expect(errorCallback).toHaveBeenCalledWith('update');
		});
	});

	describe('cleanup and disposal', () => {
		test('cleans up resources on destroy', () => {
			const callback = mock();
			subscriber.subscribe(callback);

			subscriber.destroy();

			expect(subscriber.isDestroyed).toBe(true);
			expect(subscriber.subscriberCallbacks.size).toBe(0);
		});

		test('handles destroyed state correctly', () => {
			subscriber.destroy();
			const { current } = subscriber.subscribe(() => {});

			expect(current).toBe(null);
			expect(subscriber.subscriberCallbacks.size).toBe(0);
		});

		test('supports Symbol.dispose', () => {
			subscriber[Symbol.dispose]();
			expect(subscriber.isDestroyed).toBe(true);
		});
	});

	test('serializes correctly', () => {
		expect(subscriber.toJSON()).toBe('hello');
		expect(JSON.stringify({ data: subscriber })).toBe('{"data":"hello"}');
	});

	test('enforces abstract method implementation', () => {
		const baseSubscriber = new BaseSubscriber();
		expect(() => baseSubscriber.getCurrentValue()).toThrow('getCurrentValue must be implemented by subclass');
	});
});
