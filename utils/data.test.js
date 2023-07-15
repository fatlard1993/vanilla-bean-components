import { vi } from 'vitest';

import { debounceCallback, getCustomProperties, conditionalList } from './data';

test('debounceCallback', () => {
	vi.useFakeTimers();

	let count = 0;
	const bumpCount = (modifier = 1) => (count += modifier);

	debounceCallback(bumpCount, 100);
	debounceCallback(bumpCount, 100);
	debounceCallback(bumpCount, 100);

	vi.advanceTimersByTime(100);

	expect(count).toStrictEqual(1);

	debounceCallback(bumpCount, 100);

	vi.advanceTimersByTime(100);

	debounceCallback(bumpCount, 200);

	vi.advanceTimersByTime(100);

	expect(count).toStrictEqual(2);

	vi.advanceTimersByTime(100);

	expect(count).toStrictEqual(3);

	debounceCallback(bumpCount, 100, 3);

	vi.advanceTimersByTime(100);

	expect(count).toStrictEqual(6);
});

test('getCustomProperties', () => {
	class TestClass {
		constructor() {}

		testFunction() {}
	}

	TestClass.prototype.testProto = 'test';

	const testObject = {
		testProp: 'test',
	};

	expect(getCustomProperties(new TestClass())).toStrictEqual(['testFunction', 'testProto']);

	expect(getCustomProperties(testObject)).toStrictEqual(['testProp']);
});

test('conditionalList', () => {
	expect(
		conditionalList([
			{ if: false, thenItem: 1, elseItem: 4 },
			{ if: true, thenItem: 8, elseItem: 4 },
			{ if: false, thenItems: [11, 9] },
			{ alwaysItem: 15 },
			{ if: true, thenItems: [16] },
			{ if: true, elseItems: [4, 44, 444] },
			{ alwaysItems: [23, 42] },
		]),
	).toStrictEqual([4, 8, 15, 16, 23, 42]);
});
