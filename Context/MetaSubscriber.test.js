import { delay } from '../utils/data';
import Context from './Context';
import MetaSubscriber from './MetaSubscriber';

describe('MetaSubscriber', () => {
	let contextA, contextB, contextC;

	beforeEach(() => {
		contextA = new Context({ firstName: 'John', age: 30 });
		contextB = new Context({ lastName: 'Doe', city: 'NYC' });
		contextC = new Context({ score: 100, level: 5 });
	});

	afterEach(() => {
		contextA?.destroy();
		contextB?.destroy();
		contextC?.destroy();
	});

	describe('construction and validation', () => {
		test('creates basic multi-target subscriber', () => {
			const fullName = new MetaSubscriber(
				{ context: contextA, key: 'firstName' },
				{ context: contextB, key: 'lastName' },
				(first, last) => `${first} ${last}`,
			);

			expect(fullName.__isMetaSubscriber).toBe(true);
			expect(fullName.__isSubscriber).toBe(true);
			expect(fullName.toString()).toBe('John Doe');

			fullName.destroy();
		});

		test('uses default combiner when none provided', () => {
			const values = new MetaSubscriber(
				{ context: contextA, key: 'firstName' },
				{ context: contextB, key: 'lastName' },
			);

			expect(values.toJSON()).toEqual(['John', 'Doe']);
			values.destroy();
		});

		test('validates construction parameters', () => {
			expect(() => new MetaSubscriber()).toThrow('MetaSubscriber requires at least one watch target');

			expect(() => new MetaSubscriber({ context: contextA, key: 123 })).toThrow(
				'MetaSubscriber requires at least one watch target',
			);

			expect(() => new MetaSubscriber({ context: null, key: 'test' })).toThrow(
				'MetaSubscriber requires at least one watch target',
			);

			expect(() => new MetaSubscriber({ context: contextA, key: 'firstName', parser: 'not-function' })).toThrow(
				'Target 0 parser must be a function',
			);

			expect(
				() => new MetaSubscriber({ context: contextA, key: 'firstName' }, first => first, { debounceMs: -1 }),
			).toThrow('MetaSubscriber debounceMs must be a non-negative number');
		});

		test('validates targets after successful parsing', () => {
			const destroyedContext = new Context({ test: 1 });
			destroyedContext.destroy();
			expect(() => new MetaSubscriber({ context: destroyedContext, key: 'test' })).toThrow(
				'Target 0 context is destroyed',
			);

			const withIgnoredCombiner = new MetaSubscriber({ context: contextA, key: 'firstName' }, 'not-a-function');
			expect(withIgnoredCombiner.toJSON()).toEqual(['John']);
			withIgnoredCombiner.destroy();

			try {
				const meta = Object.create(MetaSubscriber.prototype);
				MetaSubscriber.prototype.validateArguments.call(
					meta,
					[{ context: contextA, key: 'firstName' }],
					'not-a-function',
					{},
				);

				expect(false).toBe(true);
			} catch (error) {
				expect(error.message).toMatch(/combiner must be a function/i);
			}
		});
	});

	describe('multi-target reactivity', () => {
		test('responds to changes in any target', () => {
			const stats = new MetaSubscriber(
				{ context: contextC, key: 'score' },
				{ context: contextC, key: 'level' },
				(score, level) => ({ score, level, total: score * level }),
			);

			expect(stats.total).toBe(500);

			contextC.score = 200;
			expect(stats.total).toBe(1000);

			contextC.level = 10;
			expect(stats.total).toBe(2000);

			stats.destroy();
		});

		test('applies individual parsers correctly', () => {
			const formatted = new MetaSubscriber(
				{ context: contextA, key: 'firstName', parser: name => name.toUpperCase() },
				{ context: contextB, key: 'lastName', parser: name => name.toLowerCase() },
				(first, last) => `${first}_${last}`,
			);

			expect(formatted.toString()).toBe('JOHN_doe');

			contextA.firstName = 'Jane';
			expect(formatted.toString()).toBe('JANE_doe');

			contextB.lastName = 'SMITH';
			expect(formatted.toString()).toBe('JANE_smith');

			formatted.destroy();
		});

		test('handles parser errors gracefully', () => {
			const errorMeta = new MetaSubscriber({ context: contextA, key: 'firstName' }, () => {
				throw new Error('Combiner failed');
			});

			expect(errorMeta.toJSON()).toBe(null);
			errorMeta.destroy();
		});
	});

	describe('subscription system', () => {
		test('notifies subscribers of combined changes', () => {
			const callback = mock();
			const fullName = new MetaSubscriber(
				{ context: contextA, key: 'firstName' },
				{ context: contextB, key: 'lastName' },
				(first, last) => `${first} ${last}`,
			);

			const { current } = fullName.subscribe(callback);
			expect(current).toBe('John Doe');

			contextA.firstName = 'Jane';
			expect(callback).toHaveBeenCalledWith('Jane Doe');

			contextB.lastName = 'Smith';
			expect(callback).toHaveBeenCalledWith('Jane Smith');

			fullName.destroy();
		});

		test('validates subscription parameters', () => {
			const meta = new MetaSubscriber({ context: contextA, key: 'firstName' });

			expect(() => meta.subscribe('not-function')).toThrow(/subscribe callback must be a function/i);
			meta.destroy();
		});
	});

	describe('debouncing behavior', () => {
		test('handles rapid changes correctly', async () => {
			const callback = mock();
			const debounced = new MetaSubscriber(
				{ context: contextA, key: 'firstName' },
				{ context: contextB, key: 'lastName' },
				(first, last) => `${first} ${last}`,
				{ debounceMs: 10 },
			);

			debounced.subscribe(callback);

			contextA.firstName = 'Jane';
			contextB.lastName = 'Smith';

			await delay(20);

			expect(callback).toHaveBeenCalledWith('Jane Smith');
			debounced.destroy();
		});

		test('immediate updates when debounceMs is 0', () => {
			const callback = mock();
			const immediate = new MetaSubscriber({ context: contextA, key: 'firstName' }, first => first, { debounceMs: 0 });

			immediate.subscribe(callback);
			contextA.firstName = 'Jane';

			expect(callback).toHaveBeenCalledWith('Jane');
			immediate.destroy();
		});
	});

	describe('resource management', () => {
		test('manages multiple subscriptions correctly', () => {
			const contexts = Array.from({ length: 5 }, (_, i) => new Context({ value: i }));
			const sum = new MetaSubscriber(...contexts.map(context => ({ context, key: 'value' })), (...values) =>
				values.reduce((a, b) => a + b, 0),
			);

			expect(sum.valueOf()).toBe(10);
			expect(sum.subscriptions.length).toBe(5);

			contexts[0].value = 10;
			expect(sum.valueOf()).toBe(20);

			sum.destroy();
			expect(sum.isDestroyed).toBe(true);
			expect(sum.subscriptions.length).toBe(0);

			contexts.forEach(context => context.destroy());
		});

		test('supports Symbol.dispose', () => {
			const disposable = new MetaSubscriber({ context: contextA, key: 'firstName' });
			disposable[Symbol.dispose]();
			expect(disposable.isDestroyed).toBe(true);
		});

		test('handles cleanup errors gracefully', () => {
			const meta = new MetaSubscriber({ context: contextA, key: 'firstName' });

			meta.subscriptions[0].unsubscribe = () => {
				throw new Error('Cleanup error');
			};

			expect(() => meta.destroy()).not.toThrow();
			expect(meta.isDestroyed).toBe(true);
		});
	});
});
