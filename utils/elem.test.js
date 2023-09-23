/// <reference lib="dom" />

import { getElemIndex, isDescendantOf } from './elem';

test('getElemIndex', async () => {
	const testElem1 = document.createElement('div');
	document.body.append(testElem1);

	const testElem2 = document.createElement('div');
	document.body.append(testElem2);

	expect(getElemIndex(testElem1), 0);

	expect(getElemIndex(testElem2), 1);
});

test('isDescendantOf', async () => {
	const testElem1 = document.createElement('div');
	document.body.append(testElem1);

	const testElem2 = document.createElement('div');
	testElem1.append(testElem2);

	expect(isDescendantOf(testElem1, document.body), true);

	expect(isDescendantOf(testElem2, testElem1), true);

	expect(isDescendantOf(testElem2, document.body), true);

	expect(isDescendantOf(testElem1, testElem2), false);
});
