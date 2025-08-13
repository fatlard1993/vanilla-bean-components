import { debounce, throttle, delay, retry, convertRange, getCustomProperties, conditionalList, orderBy } from './data';

describe('data utilities', () => {
	describe('debounce', () => {
		test('returns a debounced function', () => {
			const callback = mock();
			const debounced = debounce(callback, 100);

			expect(typeof debounced).toBe('function');
			expect(debounced).not.toBe(callback);
		});

		test('delays function execution', async () => {
			const callback = mock();
			const debounced = debounce(callback, 50);

			debounced();
			expect(callback).not.toHaveBeenCalled();

			await delay(60);
			expect(callback).toHaveBeenCalledTimes(1);
		});

		test('cancels previous calls when called again', async () => {
			const callback = mock();
			const debounced = debounce(callback, 50);

			debounced('first');
			await delay(25);
			debounced('second');
			await delay(25);
			debounced('third');
			await delay(60);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith('third');
		});

		test('passes arguments correctly', async () => {
			const callback = mock();
			const debounced = debounce(callback, 50);

			debounced('arg1', 'arg2', 42);
			await delay(60);

			expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 42);
		});

		test('uses default delay of 400ms', async () => {
			const callback = mock();
			const debounced = debounce(callback);

			debounced();

			await delay(300);
			expect(callback).not.toHaveBeenCalled();

			await delay(150);
			expect(callback).toHaveBeenCalledTimes(1);
		});

		test('handles rapid successive calls correctly', async () => {
			const callback = mock();
			const debounced = debounce(callback, 50);

			for (let i = 0; i < 10; i++) {
				debounced(i);
				await delay(5);
			}

			await delay(60);
			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(9);
		});

		test('handles zero delay', async () => {
			const callback = mock();
			const debounced = debounce(callback, 0);

			debounced();
			await delay(10);
			expect(callback).toHaveBeenCalledTimes(1);
		});

		test('handles multiple independent debounced functions', async () => {
			const callback1 = mock();
			const callback2 = mock();
			const debounced1 = debounce(callback1, 50);
			const debounced2 = debounce(callback2, 50);

			debounced1('first');
			debounced2('second');

			await delay(60);

			expect(callback1).toHaveBeenCalledWith('first');
			expect(callback2).toHaveBeenCalledWith('second');
		});
	});

	describe('throttle', () => {
		test('does not execute callback immediately', () => {
			const callback = mock(() => 'result');
			const throttled = throttle(callback, 100);

			const result = throttled('arg');

			expect(callback).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		test('executes after delay period', async () => {
			const callback = mock();
			const throttled = throttle(callback, 50);

			throttled('test');
			expect(callback).not.toHaveBeenCalled();

			await delay(60);

			throttled('test2');
			expect(callback).toHaveBeenCalledTimes(1);
		});

		test('uses default delay of 400ms', async () => {
			const callback = mock();
			const throttled = throttle(callback);

			throttled();
			expect(callback).not.toHaveBeenCalled();

			await delay(300);
			throttled();
			expect(callback).not.toHaveBeenCalled();

			await delay(150);
			throttled();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		test('returns function that can be called', () => {
			const callback = mock();
			const throttled = throttle(callback, 100);

			expect(typeof throttled).toBe('function');
			expect(() => throttled()).not.toThrow();
		});

		test('handles arguments when function is called', async () => {
			const callback = mock();
			const throttled = throttle(callback, 50);

			throttled('arg1', 'arg2');
			expect(callback).not.toHaveBeenCalled();

			await delay(60);
			throttled('arg1', 'arg2');
			expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
		});

		test('respects timing constraints', async () => {
			const callback = mock();
			const throttled = throttle(callback, 100);

			throttled();
			throttled();
			throttled();

			expect(callback).not.toHaveBeenCalled();

			await delay(110);
			throttled();
			expect(callback).toHaveBeenCalledTimes(1);
		});
	});

	describe('delay', () => {
		test('resolves after specified time', async () => {
			const start = Date.now();
			await delay(50);
			const elapsed = Date.now() - start;

			expect(elapsed).toBeGreaterThanOrEqual(45);
		});

		test('returns a promise', () => {
			const result = delay(10);
			expect(result).toBeInstanceOf(Promise);
		});

		test('handles zero delay', async () => {
			const start = Date.now();
			await delay(0);
			const elapsed = Date.now() - start;

			expect(elapsed).toBeLessThan(20);
		});

		test('resolves with undefined', async () => {
			const result = await delay(1);
			expect(result).toBeUndefined();
		});

		test('can be chained', async () => {
			const start = Date.now();
			await delay(10).then(() => delay(10));
			const elapsed = Date.now() - start;

			expect(elapsed).toBeGreaterThanOrEqual(15);
		});
	});

	describe('retry', () => {
		test('succeeds on first try', async () => {
			const successCallback = mock(() => 'success');

			const result = await retry(successCallback);

			expect(result).toBe('success');
			expect(successCallback).toHaveBeenCalledTimes(1);
		});

		test('retries on failure until success', async () => {
			let attempts = 0;
			const eventualSuccessCallback = mock(() => {
				attempts++;
				if (attempts < 3) throw new Error('fail');
				return 'success';
			});

			const result = await retry(eventualSuccessCallback, { delay: 5 });

			expect(result).toBe('success');
			expect(eventualSuccessCallback).toHaveBeenCalledTimes(3);
		});

		test('respects max retry limit', async () => {
			const alwaysFailCallback = mock(() => {
				throw new Error('always fails');
			});

			await expect(retry(alwaysFailCallback, { max: 2, delay: 5 })).rejects.toThrow('always fails');

			expect(alwaysFailCallback).toHaveBeenCalledTimes(3);
		});

		test('uses dynamic delay function', async () => {
			const delayFn = mock(index => index * 5);
			let attempts = 0;
			const callback = mock(() => {
				attempts++;
				if (attempts < 3) throw new Error('fail');
				return 'success';
			});

			const result = await retry(callback, { delay: delayFn, max: 3 });

			expect(result).toBe('success');
			expect(delayFn).toHaveBeenCalledWith(0);
			expect(delayFn).toHaveBeenCalledWith(1);
		});

		test('uses default options correctly', async () => {
			let attempts = 0;
			const callback = mock(() => {
				attempts++;
				if (attempts <= 3) throw new Error('fail');
				return 'success';
			});

			const result = await retry(callback);
			expect(result).toBe('success');
			expect(callback).toHaveBeenCalledTimes(4);
		});

		test('passes callback return value correctly', async () => {
			const callback = mock(() => ({ data: 'complex object' }));

			const result = await retry(callback, { delay: 5 });

			expect(result).toEqual({ data: 'complex object' });
		});

		test('preserves error details on final failure', async () => {
			const specificError = new Error('Specific failure reason');
			const callback = mock(() => {
				throw specificError;
			});

			try {
				await retry(callback, { max: 1, delay: 5 });
				expect(true).toBe(false);
			} catch (error) {
				expect(error).toBe(specificError);
				expect(error.message).toBe('Specific failure reason');
			}
		});

		test('handles zero delay', async () => {
			let attempts = 0;
			const callback = mock(() => {
				attempts++;
				if (attempts < 2) throw new Error('fail');
				return 'success';
			});

			const result = await retry(callback, { delay: 0 });
			expect(result).toBe('success');
		});
	});

	describe('convertRange', () => {
		test('converts values between ranges correctly', () => {
			expect(convertRange(2, [0, 3], [0, 9])).toBe(6);
			expect(convertRange(10, [0, 10], [10, 0])).toBe(0);
			expect(convertRange(5, [0, 10], [0, 100])).toBe(50);
		});

		test('handles negative ranges', () => {
			expect(convertRange(-5, [-10, 0], [0, 100])).toBe(50);
			expect(convertRange(0, [-10, 10], [-100, 100])).toBe(0);
			expect(convertRange(-10, [-10, 10], [0, 200])).toBe(0);
		});

		test('handles decimal values precisely', () => {
			const result = convertRange(4.2, [-100, 100], [199, -199]);
			expect(result).toBeCloseTo(-8.358, 3);
		});

		test('handles identical source and target ranges', () => {
			expect(convertRange(5, [0, 10], [0, 10])).toBe(5);
			expect(convertRange(-3, [-5, 5], [-5, 5])).toBe(-3);
		});

		test('handles edge values correctly', () => {
			expect(convertRange(0, [0, 10], [0, 100])).toBe(0);
			expect(convertRange(10, [0, 10], [0, 100])).toBe(100);
			expect(convertRange(5, [0, 10], [100, 0])).toBe(50);
		});

		test('handles reversed ranges', () => {
			expect(convertRange(2, [0, 10], [100, 0])).toBe(80);
			expect(convertRange(8, [0, 10], [100, 0])).toBe(20);
		});

		test('handles zero-width source range', () => {
			const result = convertRange(5, [5, 5], [0, 10]);
			expect(isNaN(result) || !isFinite(result)).toBe(true);
		});

		test('handles floating point precision', () => {
			const result = convertRange(0.1, [0, 1], [0, 10]);
			expect(result).toBeCloseTo(1, 10);
		});

		test('handles large numbers', () => {
			const result = convertRange(1000000, [0, 2000000], [0, 100]);
			expect(result).toBe(50);
		});

		test('handles values outside source range', () => {
			expect(convertRange(-5, [0, 10], [0, 100])).toBe(-50);
			expect(convertRange(15, [0, 10], [0, 100])).toBe(150);
		});
	});

	describe('getCustomProperties', () => {
		test('finds custom properties on plain objects', () => {
			const testObject = {
				customProp: 'test',
				anotherProp: 42,
				methodProp: function () {
					return 'method';
				},
			};

			const result = getCustomProperties(testObject);
			expect(result).toContain('customProp');
			expect(result).toContain('anotherProp');
			expect(result).toContain('methodProp');
		});

		test('excludes native object properties', () => {
			const testObject = {
				customProp: 'test',
			};

			const result = getCustomProperties(testObject);
			expect(result).not.toContain('constructor');
			expect(result).not.toContain('toString');
			expect(result).not.toContain('valueOf');
			expect(result).not.toContain('hasOwnProperty');
			expect(result).not.toContain('__proto__');
		});

		test('finds properties on class instances', () => {
			class TestClass {
				constructor() {
					this.instanceProp = 'instance';
				}

				methodProp() {
					return 'method';
				}
			}

			TestClass.prototype.protoProp = 'proto';

			const instance = new TestClass();
			const result = getCustomProperties(instance);

			expect(result).toContain('instanceProp');
			expect(result).toContain('methodProp');
			expect(result).toContain('protoProp');
		});

		test('handles null and undefined gracefully', () => {
			expect(getCustomProperties(null)).toEqual([]);
			expect(getCustomProperties(undefined)).toEqual([]);
		});

		test('finds symbol properties', () => {
			const symbolProp = Symbol('test');
			const obj = {
				stringProp: 'test',
				[symbolProp]: 'symbol value',
			};

			const result = getCustomProperties(obj);
			expect(result).toContain('stringProp');
			expect(result).toContain(symbolProp);
		});

		test('removes duplicates from inheritance chain', () => {
			class Parent {
				parentMethod() {
					return 'parent';
				}
			}

			class Child extends Parent {
				childMethod() {
					return 'child';
				}
				parentMethod() {
					return 'overridden';
				}
			}

			const instance = new Child();
			const result = getCustomProperties(instance);

			const parentMethodCount = result.filter(prop => prop === 'parentMethod').length;
			expect(parentMethodCount).toBe(1);
			expect(result).toContain('childMethod');
		});

		test('handles empty objects', () => {
			const result = getCustomProperties({});
			expect(Array.isArray(result)).toBe(true);
		});

		test('handles objects with only native properties', () => {
			const obj = Object.create(null);
			const result = getCustomProperties(obj);
			expect(result).toEqual([]);
		});

		test('handles functions as objects', () => {
			/**
			 *
			 */
			function testFunction() {}
			testFunction.customProp = 'custom';

			const result = getCustomProperties(testFunction);
			expect(result).toContain('customProp');
		});
	});

	describe('conditionalList', () => {
		test('includes items when condition is true', () => {
			const result = conditionalList([
				{ if: true, thenItem: 'included' },
				{ if: false, thenItem: 'excluded' },
			]);

			expect(result).toEqual(['included']);
		});

		test('includes else items when condition is false', () => {
			const result = conditionalList([
				{ if: false, thenItem: 'excluded', elseItem: 'included' },
				{ if: true, thenItem: 'also-included' },
			]);

			expect(result).toEqual(['included', 'also-included']);
		});

		test('handles array items based on implementation', () => {
			const result = conditionalList([
				{ if: true, thenItems: ['a', 'b'] },
				{ if: false, elseItems: ['c', 'd'] },
			]);

			expect(Array.isArray(result)).toBe(true);
			expect(result).toContain('a');
			expect(result).toContain('b');
		});

		test('handles always items behavior', () => {
			const result = conditionalList([{ if: false, thenItem: 'excluded', alwaysItem: 'always' }]);

			expect(result).toEqual(['always']);
		});

		test('filters out items with no valid conditions', () => {
			const result = conditionalList([{ if: false }, { invalidProp: 'test' }, { if: true, thenItem: 'valid' }]);

			expect(result).toEqual(['valid']);
		});

		test('handles the original test case correctly', () => {
			const result = conditionalList([
				{ if: false, thenItem: 1, elseItem: 4 },
				{ if: true, thenItem: 8, elseItem: 4 },
				{ if: false, thenItems: [11, 9] },
				{ alwaysItem: 15 },
				{ if: true, thenItems: [16] },
				{ if: true, elseItems: [4, 44, 444] },
				{ alwaysItems: [23, 42] },
			]);

			expect(result).toEqual([4, 8, 15, 16, 23, 42]);
		});

		test('handles empty input array', () => {
			expect(conditionalList([])).toEqual([]);
		});

		test('handles undefined and null values based on implementation', () => {
			const result = conditionalList([
				{ if: false, elseItem: null },
				{ alwaysItem: 0 },
				{ if: true, thenItems: [null, undefined] },
			]);

			expect(result).toContain(0);
			expect(result).toContain(null);
			expect(result).toContain(undefined);
		});

		test('handles boolean and falsy conditions correctly', () => {
			const result = conditionalList([
				{ if: 0, thenItem: 'zero', elseItem: 'not-zero' },
				{ if: '', thenItem: 'empty', elseItem: 'not-empty' },
				{ if: false, thenItem: 'false', elseItem: 'not-false' },
				{ if: null, thenItem: 'null', elseItem: 'not-null' },
			]);

			expect(result).toEqual(['not-zero', 'not-empty', 'not-false', 'not-null']);
		});
	});

	describe('orderBy', () => {
		const testData = [
			{ name: 'beta', value: 0, priority: 'high' },
			{ name: 'alpha', value: 3, priority: 'low' },
			{ name: 'delta', value: 1, priority: 'medium' },
			{ name: 'charlie', value: 0, priority: 'high' },
		];

		test('sorts by single property ascending', () => {
			const sorted = [...testData].sort(orderBy({ property: 'name', direction: 'asc' }));

			expect(sorted.map(item => item.name)).toEqual(['alpha', 'beta', 'charlie', 'delta']);
		});

		test('sorts by single property descending', () => {
			const sorted = [...testData].sort(orderBy({ property: 'name', direction: 'desc' }));

			expect(sorted.map(item => item.name)).toEqual(['delta', 'charlie', 'beta', 'alpha']);
		});

		test('sorts by multiple properties', () => {
			const sorted = [...testData].sort(
				orderBy([
					{ property: 'value', direction: 'asc' },
					{ property: 'name', direction: 'asc' },
				]),
			);

			expect(sorted).toEqual([
				{ name: 'beta', value: 0, priority: 'high' },
				{ name: 'charlie', value: 0, priority: 'high' },
				{ name: 'delta', value: 1, priority: 'medium' },
				{ name: 'alpha', value: 3, priority: 'low' },
			]);
		});

		test('handles numeric sorting correctly', () => {
			const numbers = [{ id: '10' }, { id: '2' }, { id: '1' }, { id: '20' }];

			const sorted = numbers.sort(orderBy({ property: 'id' }));
			expect(sorted.map(item => item.id)).toEqual(['1', '2', '10', '20']);
		});

		test('handles undefined properties gracefully', () => {
			const withUndefined = [{ name: 'b' }, { name: 'a' }, {}, { name: 'c' }];

			const sorted = withUndefined.sort(orderBy({ property: 'name' }));
			expect(sorted.length).toBe(4);
		});

		test('sorts without property (direct comparison)', () => {
			const primitives = ['delta', 'alpha', 'charlie', 'beta'];
			const sorted = primitives.sort(orderBy({ direction: 'asc' }));

			expect(sorted).toEqual(['alpha', 'beta', 'charlie', 'delta']);
		});

		test('defaults to ascending direction', () => {
			const sorted1 = [...testData].sort(orderBy({ property: 'name' }));
			const sorted2 = [...testData].sort(orderBy({ property: 'name', direction: 'asc' }));

			expect(sorted1).toEqual(sorted2);
		});

		test('handles empty arrays', () => {
			const result = [].sort(orderBy({ property: 'name' }));
			expect(result).toEqual([]);
		});

		test('handles single item arrays', () => {
			const single = [{ name: 'only' }];
			const result = single.sort(orderBy({ property: 'name' }));
			expect(result).toEqual([{ name: 'only' }]);
		});
	});

	describe('integration and real-world scenarios', () => {
		test('debounce with complex operations', async () => {
			const processedValues = [];
			const processor = value => {
				processedValues.push(value);
				return `processed: ${value}`;
			};

			const debouncedProcessor = debounce(processor, 30);

			debouncedProcessor('first');
			debouncedProcessor('second');
			debouncedProcessor('third');

			await delay(40);

			expect(processedValues).toEqual(['third']);
		});

		test('throttle behavior verification', async () => {
			let callCount = 0;
			const counter = () => {
				callCount++;
				return callCount;
			};

			const throttledCounter = throttle(counter, 50);

			throttledCounter();
			throttledCounter();
			throttledCounter();

			expect(callCount).toBe(0);

			await delay(60);
			throttledCounter();
			expect(callCount).toBe(1);
		});

		test('retry with exponential back-off', async () => {
			let attempts = 0;
			const unstableOperation = () => {
				attempts++;
				if (attempts < 3) throw new Error(`Attempt ${attempts} failed`);
				return `Success after ${attempts} attempts`;
			};

			const exponentialDelay = index => Math.pow(2, index) * 10;

			const result = await retry(unstableOperation, {
				delay: exponentialDelay,
				max: 3,
			});

			expect(result).toBe('Success after 3 attempts');
		});

		test('complex data transformation pipeline', () => {
			const rawData = [
				{ name: 'John', age: 30, active: true, score: 85 },
				{ name: 'Alice', age: 25, active: false, score: 92 },
				{ name: 'Bob', age: 35, active: true, score: 78 },
				{ name: 'Carol', age: 28, active: true, score: 88 },
			];

			const processed = conditionalList([{ if: true, thenItems: rawData.filter(user => user.active) }])
				.sort(orderBy({ property: 'score', direction: 'desc' }))
				.map(user => ({
					...user,
					grade: convertRange(user.score, [0, 100], [0, 4]),
				}));

			expect(processed).toHaveLength(3);
			expect(processed[0].name).toBe('Carol');
			expect(processed[0].grade).toBeCloseTo(3.52, 2);
		});

		test('performance with large data sets', async () => {
			const largeData = Array.from({ length: 1000 }, (_, i) => ({
				id: i,
				name: `item-${i}`,
				value: Math.random() * 100,
			}));

			const start = Date.now();

			const sorted = largeData.sort(orderBy({ property: 'value', direction: 'desc' }));
			const properties = getCustomProperties(largeData[0]);

			const elapsed = Date.now() - start;

			expect(sorted.length).toBe(1000);
			expect(sorted[0].value).toBeGreaterThanOrEqual(sorted[999].value);
			expect(properties).toContain('id');
			expect(elapsed).toBeLessThan(100);
		});
	});
});
