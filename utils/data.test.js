import { vi } from 'vitest';

import { debounceCallback, getCustomProperties } from './data';

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
