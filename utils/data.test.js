import { debounce, throttle, delay, retry, convertRange, getCustomProperties, conditionalList, orderBy } from './data';

test.skip('debounce', () => {
	const useFakeTimers = () => {};
	const advanceTimersByTime = () => {};

	useFakeTimers();

	let count = 0;
	const bumpCount = (modifier = 1) => (count += modifier);

	debounce(bumpCount, 100);
	debounce(bumpCount, 100);
	debounce(bumpCount, 100);

	advanceTimersByTime(100);

	expect(count).toStrictEqual(1);

	debounce(bumpCount, 100);

	advanceTimersByTime(100);

	debounce(bumpCount, 200);

	advanceTimersByTime(100);

	expect(count).toStrictEqual(2);

	advanceTimersByTime(100);

	expect(count).toStrictEqual(3);

	debounce(bumpCount, 100, 3);

	advanceTimersByTime(100);

	expect(count).toStrictEqual(6);
});

test.skip('throttle', () => {
	throttle();
});

test.skip('delay', () => {
	delay();
});

test('retry', async () => {
	let count = 0;
	const generateCallback = (failCount = 0) => {
		count = 0;

		return () => {
			if (count >= failCount) return 'success';

			++count;

			throw new Error('fail');
		};
	};
	const options = { max: 2, delay: 0 };

	expect(await retry(generateCallback(1), options)).toEqual('success');
	expect(await retry(generateCallback(2), options)).toEqual('success');

	await expect(retry(generateCallback(3), options)).rejects.toThrow('fail');
});

test('convertRange', () => {
	expect(convertRange(2, [0, 3], [0, 9])).toStrictEqual(6);

	expect(convertRange(10, [0, 10], [10, 0])).toStrictEqual(0);

	expect(convertRange(4.2, [-100, 100], [199, -199])).toStrictEqual(-8.358000000000004);
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

test('orderBy', () => {
	expect(
		[{ testProp: 'beta' }, { testProp: 'alpha' }, { testProp: 'delta' }, { testProp: 'charlie' }].sort(
			orderBy({ property: 'testProp', direction: 'asc' }),
		),
	).toEqual([{ testProp: 'alpha' }, { testProp: 'beta' }, { testProp: 'charlie' }, { testProp: 'delta' }]);

	expect(
		[
			{ testProp: 'beta', value: 0 },
			{ testProp: 'alpha', value: 3 },
			{ testProp: 'beta', value: 9 },
			{ testProp: 'charlie', value: 0 },
		].sort(
			orderBy([
				{ property: 'testProp', direction: 'asc' },
				{ property: 'value', direction: 'desc' },
			]),
		),
	).toEqual([
		{ testProp: 'alpha', value: 3 },
		{ testProp: 'beta', value: 9 },
		{ testProp: 'beta', value: 0 },
		{ testProp: 'charlie', value: 0 },
	]);
});
