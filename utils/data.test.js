import { vi } from 'vitest';

import { debounceCb, run } from './data';

test('debounceCb', () => {
	vi.useFakeTimers();

	let count = 0;
	const bumpCount = () => count++;

	debounceCb(bumpCount, 100);
	debounceCb(bumpCount, 100);
	debounceCb(bumpCount, 100);

	vi.advanceTimersByTime(100);

	expect(count).toStrictEqual(1);

	debounceCb(bumpCount, 100);

	vi.advanceTimersByTime(100);

	debounceCb(bumpCount, 200);

	vi.advanceTimersByTime(100);

	expect(count).toStrictEqual(2);

	vi.advanceTimersByTime(100);

	expect(count).toStrictEqual(3);
});

test('run', () => {
	let count = 0;
	const bumpCount = () => count++;
	const actionArr = new Array(3).fill(bumpCount);

	run(actionArr);

	expect(count).toStrictEqual(3);

	run(actionArr, true);

	expect(count).toStrictEqual(6);
	expect(actionArr).toStrictEqual([]);
});
