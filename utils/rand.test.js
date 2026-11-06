import { rand, randFromArray, randInt, shuffleArray } from './rand';

describe('rand utilities', () => {
	describe('rand', () => {
		test('returns a number', () => {
			const result = rand();
			expect(typeof result).toBe('number');
		});

		test('returns values within default range', () => {
			for (let i = 0; i < 100; i++) {
				const result = rand();
				expect(result).toBeGreaterThanOrEqual(-999);
				expect(result).toBeLessThan(999);
			}
		});

		test('returns values within custom range', () => {
			for (let i = 0; i < 50; i++) {
				const result = rand(10, 20);
				expect(result).toBeGreaterThanOrEqual(10);
				expect(result).toBeLessThan(20);
			}
		});

		test('handles negative ranges', () => {
			for (let i = 0; i < 50; i++) {
				const result = rand(-50, -10);
				expect(result).toBeGreaterThanOrEqual(-50);
				expect(result).toBeLessThan(-10);
			}
		});

		test('handles zero as minimum', () => {
			for (let i = 0; i < 50; i++) {
				const result = rand(0, 10);
				expect(result).toBeGreaterThanOrEqual(0);
				expect(result).toBeLessThan(10);
			}
		});

		test('handles zero as maximum', () => {
			for (let i = 0; i < 50; i++) {
				const result = rand(-10, 0);
				expect(result).toBeGreaterThanOrEqual(-10);
				expect(result).toBeLessThan(0);
			}
		});

		test('handles equal min and max', () => {
			const result = rand(5, 5);
			expect(result).toBe(5);
		});

		test('handles reversed parameters (max < min)', () => {
			for (let i = 0; i < 20; i++) {
				const result = rand(20, 10);

				expect(result).toBeGreaterThanOrEqual(10);
				expect(result).toBeLessThan(20);
			}
		});

		test('handles decimal parameters', () => {
			for (let i = 0; i < 50; i++) {
				const result = rand(1.5, 2.5);
				expect(result).toBeGreaterThanOrEqual(1.5);
				expect(result).toBeLessThan(2.5);
			}
		});

		test('handles very small ranges', () => {
			for (let i = 0; i < 50; i++) {
				const result = rand(0, 0.001);
				expect(result).toBeGreaterThanOrEqual(0);
				expect(result).toBeLessThan(0.001);
			}
		});

		test('handles very large ranges', () => {
			for (let i = 0; i < 20; i++) {
				const result = rand(-1000000, 1000000);
				expect(result).toBeGreaterThanOrEqual(-1000000);
				expect(result).toBeLessThan(1000000);
			}
		});

		test('produces different values over multiple calls', () => {
			const results = new Set();
			for (let i = 0; i < 100; i++) {
				results.add(rand(0, 1000));
			}

			expect(results.size).toBeGreaterThan(50);
		});

		test('distribution is reasonable', () => {
			let lowCount = 0;
			let highCount = 0;
			const iterations = 1000;

			for (let i = 0; i < iterations; i++) {
				const result = rand(0, 100);
				if (result < 50) lowCount++;
				else highCount++;
			}

			const ratio = Math.min(lowCount, highCount) / Math.max(lowCount, highCount);
			expect(ratio).toBeGreaterThan(0.7);
		});
	});

	describe('randInt', () => {
		test('returns an integer', () => {
			for (let i = 0; i < 50; i++) {
				const result = randInt();
				expect(Number.isInteger(result)).toBe(true);
			}
		});

		test('returns values within default range inclusive', () => {
			for (let i = 0; i < 100; i++) {
				const result = randInt();
				expect(result).toBeGreaterThanOrEqual(-999);
				expect(result).toBeLessThanOrEqual(999);
			}
		});

		test('returns values within custom range inclusive', () => {
			for (let i = 0; i < 50; i++) {
				const result = randInt(10, 15);
				expect(result).toBeGreaterThanOrEqual(10);
				expect(result).toBeLessThanOrEqual(15);
				expect(Number.isInteger(result)).toBe(true);
			}
		});

		test('handles single value range', () => {
			for (let i = 0; i < 20; i++) {
				const result = randInt(5, 5);
				expect(result).toBe(5);
			}
		});

		test('includes both min and max values', () => {
			const results = new Set();

			for (let i = 0; i < 500; i++) {
				results.add(randInt(1, 3));
			}

			expect(results.has(1)).toBe(true);
			expect(results.has(3)).toBe(true);

			expect(results.has(0)).toBe(false);
			expect(results.has(4)).toBe(false);
		});

		test('handles negative ranges', () => {
			for (let i = 0; i < 50; i++) {
				const result = randInt(-10, -5);
				expect(result).toBeGreaterThanOrEqual(-10);
				expect(result).toBeLessThanOrEqual(-5);
				expect(Number.isInteger(result)).toBe(true);
			}
		});

		test('handles zero boundaries', () => {
			for (let i = 0; i < 50; i++) {
				const result = randInt(-2, 2);
				expect(result).toBeGreaterThanOrEqual(-2);
				expect(result).toBeLessThanOrEqual(2);
				expect(Number.isInteger(result)).toBe(true);
			}
		});

		test('handles decimal parameters by converting to integers', () => {
			for (let i = 0; i < 50; i++) {
				const result = randInt(1.7, 5.9);
				expect(result).toBeGreaterThanOrEqual(2);
				expect(result).toBeLessThanOrEqual(5);
				expect(Number.isInteger(result)).toBe(true);
			}
		});

		test('produces different values over multiple calls', () => {
			const results = new Set();
			for (let i = 0; i < 100; i++) {
				results.add(randInt(1, 100));
			}

			expect(results.size).toBeGreaterThan(20);
		});

		test('distribution is reasonable for small ranges', () => {
			const counts = { 1: 0, 2: 0, 3: 0 };
			const iterations = 300;

			for (let i = 0; i < iterations; i++) {
				const result = randInt(1, 3);
				counts[result]++;
			}

			expect(counts[1]).toBeGreaterThan(50);
			expect(counts[2]).toBeGreaterThan(50);
			expect(counts[3]).toBeGreaterThan(50);
		});

		test('handles large ranges efficiently', () => {
			for (let i = 0; i < 20; i++) {
				const result = randInt(-1000000, 1000000);
				expect(result).toBeGreaterThanOrEqual(-1000000);
				expect(result).toBeLessThanOrEqual(1000000);
				expect(Number.isInteger(result)).toBe(true);
			}
		});
	});

	describe('randFromArray', () => {
		test('returns an element from the array', () => {
			const testArray = ['a', 'b', 'c', 'd', 'e'];
			for (let i = 0; i < 50; i++) {
				const result = randFromArray(testArray);
				expect(testArray).toContain(result);
			}
		});

		test('returns different elements over multiple calls', () => {
			const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
			const results = new Set();

			for (let i = 0; i < 100; i++) {
				results.add(randFromArray(testArray));
			}

			expect(results.size).toBeGreaterThan(3);
		});

		test('works with single-element array', () => {
			const testArray = ['only'];
			for (let i = 0; i < 20; i++) {
				const result = randFromArray(testArray);
				expect(result).toBe('only');
			}
		});

		test('works with arrays of different types', () => {
			const mixedArray = [1, 'string', { key: 'value' }, true, null, undefined];

			for (let i = 0; i < 50; i++) {
				const result = randFromArray(mixedArray);
				expect(mixedArray).toContain(result);
			}
		});

		test('works with arrays containing duplicates', () => {
			const duplicateArray = ['a', 'b', 'a', 'c', 'a'];

			for (let i = 0; i < 50; i++) {
				const result = randFromArray(duplicateArray);
				expect(['a', 'b', 'c']).toContain(result);
			}
		});

		test('distribution is reasonable', () => {
			const testArray = ['x', 'y', 'z'];
			const counts = { x: 0, y: 0, z: 0 };
			const iterations = 300;

			for (let i = 0; i < iterations; i++) {
				const result = randFromArray(testArray);
				counts[result]++;
			}

			expect(counts.x).toBeGreaterThan(50);
			expect(counts.y).toBeGreaterThan(50);
			expect(counts.z).toBeGreaterThan(50);
		});

		test('works with array of objects', () => {
			const objectArray = [
				{ id: 1, name: 'first' },
				{ id: 2, name: 'second' },
				{ id: 3, name: 'third' },
			];

			for (let i = 0; i < 30; i++) {
				const result = randFromArray(objectArray);
				expect(result).toHaveProperty('id');
				expect(result).toHaveProperty('name');
				expect([1, 2, 3]).toContain(result.id);
			}
		});

		test('works with nested arrays', () => {
			const nestedArray = [
				[1, 2],
				[3, 4],
				[5, 6],
			];

			for (let i = 0; i < 30; i++) {
				const result = randFromArray(nestedArray);
				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toBe(2);
			}
		});

		test('handles empty array gracefully', () => {
			const emptyArray = [];
			const result = randFromArray(emptyArray);

			expect(result).toBeUndefined();
		});

		test('works with very large arrays', () => {
			const largeArray = Array.from({ length: 10000 }, (_, i) => i);

			for (let i = 0; i < 20; i++) {
				const result = randFromArray(largeArray);
				expect(result).toBeGreaterThanOrEqual(0);
				expect(result).toBeLessThan(10000);
				expect(Number.isInteger(result)).toBe(true);
			}
		});
	});

	describe('at the edges', () => {
		test('randInt stays within bounds at the ends of the safe integer range', () => {
			for (let i = 0; i < 50; i++) {
				const high = randInt(Number.MAX_SAFE_INTEGER - 100, Number.MAX_SAFE_INTEGER);
				const low = randInt(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 100);

				expect(Number.isInteger(high) && high >= Number.MAX_SAFE_INTEGER - 100 && high <= Number.MAX_SAFE_INTEGER).toBe(
					true,
				);
				expect(Number.isInteger(low) && low >= Number.MIN_SAFE_INTEGER && low <= Number.MIN_SAFE_INTEGER + 100).toBe(
					true,
				);
			}
		});

		test('randInt given its bounds the wrong way round still lands between them, both ends included', () => {
			const seen = new Set(Array.from({ length: 200 }, () => randInt(5, 1)));

			expect([...seen].every(n => n >= 1 && n <= 5)).toBe(true);
			expect(seen.has(1) && seen.has(5)).toBe(true);
		});

		test('randFromArray gives back the element itself, whatever it is', () => {
			for (const item of [0, false, null, undefined, '']) expect(randFromArray([item])).toBe(item);
		});
	});

	describe('shuffleArray', () => {
		test('reorders the same array, keeping every item', () => {
			const array = [1, 2, 3, 4, 5, 6, 7, 8];
			const shuffled = shuffleArray(array);

			expect(shuffled).toBe(array);
			expect([...shuffled].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
		});
	});
});
