global.document = {};

import storage from './storage';

const getItem = [];
const setItem = [];
const deleteItem = [];

storage.localStorage = {
	getItem: (...args) => getItem.push(args),
	setItem: (...args) => setItem.push(args),
	removeItem: (...args) => deleteItem.push(args),
};

test('get (localStorage)', () => {
	storage.get('key');

	expect(getItem.pop()).toStrictEqual(['key']);
});

test('set (localStorage)', () => {
	storage.set('key', 'value');

	expect(setItem.pop()).toStrictEqual(['key', 'value']);
});

test('delete (localStorage)', () => {
	storage.delete('key');

	expect(deleteItem.pop()).toStrictEqual(['key']);
});

test('get (cookie)', () => {
	storage.localStorage = undefined;
	document.cookie = 'key=value;';

	storage.get('key');

	expect(storage.get('key')).toStrictEqual('value');
});

test('set (cookie)', () => {
	storage.localStorage = undefined;
	document.cookie = undefined;

	storage.set('key', 'value');

	expect(document.cookie).toStrictEqual('key=value;');

	storage.set('key2', 'value');
});

test('delete (cookie)', () => {
	storage.localStorage = undefined;
	document.cookie = 'key=value;';

	storage.delete('key');

	expect(document.cookie).toStrictEqual('key=; expires=Thu, 01 Jan 1970 00:00:01 GMT;');
});
