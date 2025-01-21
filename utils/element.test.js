/// <reference lib="dom" />

import { getElementIndex, isDescendantOf } from './element';

test('getElementIndex', async () => {
	const testElem1 = document.createElement('div');
	document.body.append(testElem1);

	const testElem2 = document.createElement('div');
	document.body.append(testElem2);

	expect(getElementIndex(testElem1), 0);

	expect(getElementIndex(testElem2), 1);
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
