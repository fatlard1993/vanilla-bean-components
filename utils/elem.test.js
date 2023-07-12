import { JSDOM } from 'jsdom';

import { empty, remove, getElemIndex, isDescendantOf } from './elem';

const container = new JSDOM().window.document.body;

test('empty', async () => {
	const testElem = document.createElement('div');
	testElem.textContent = 'testElem';
	container.append(testElem);

	expect(container.children.length, 1);

	empty(container);

	expect(container.children.length, 0);
});

test('remove', async () => {
	const testElem = document.createElement('div');
	testElem.textContent = 'testElem';
	container.append(testElem);

	expect(container.children.length, 1);

	remove(testElem);

	expect(container.children.length, 0);
});

test('getElemIndex', async () => {
	const testElem1 = document.createElement('div');
	container.append(testElem1);

	const testElem2 = document.createElement('div');
	container.append(testElem2);

	expect(getElemIndex(testElem1), 0);

	expect(getElemIndex(testElem2), 1);
});

test('isDescendantOf', async () => {
	const testElem1 = document.createElement('div');
	container.append(testElem1);

	const testElem2 = document.createElement('div');
	testElem1.append(testElem2);

	expect(isDescendantOf(testElem1, container), true);

	expect(isDescendantOf(testElem2, testElem1), true);

	expect(isDescendantOf(testElem2, container), true);

	expect(isDescendantOf(testElem1, testElem2), false);
});
