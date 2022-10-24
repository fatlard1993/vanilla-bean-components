global.window = {
	location: {
		search: '',
	},
};

const replaceState = [];

global.history = {
	replaceState: (...args) => replaceState.push(args),
};

import query from './query';

test('write:fetch=true', () => {
	window.location.search = '';

	query.write({ query: 'key=value', fetch: true });

	expect(window.location.search).toStrictEqual('?key=value');
});

test('write:fetch=false', () => {
	window.location.search = '';

	query.write({ query: '?key=value' });

	expect(replaceState.pop()).toStrictEqual([null, '?key=value', '?key=value']);
});

test('fetch', () => {
	window.location.search = 'key=value';

	query.fetch();

	expect(window.location.search).toStrictEqual('?key=value');
});

test('stringify', () => {
	expect(query.stringify({ key: 'v@lue', key2: 'value' })).toStrictEqual('key=v%40lue&key2=value');
});

test('parse', () => {
	window.location.search = '?key=value&key2=value2';

	expect(query.parse()).toStrictEqual({ key: 'value', key2: 'value2' });
});

test('get', () => {
	window.location.search = '?key=value&key2=value2';

	expect(query.get('key')).toStrictEqual('value');
	expect(query.get('key2')).toStrictEqual('value2');
});

test('set', () => {
	window.location.search = '';

	query.set('key', 'value', true);

	expect(window.location.search).toStrictEqual('?key=value');
});

test('delete', () => {
	window.location.search = '?key=value';

	query.delete();

	expect(window.location.search).toStrictEqual('');
});

test('delete:key', () => {
	window.location.search = '?key=value&key2=value2';

	query.delete('key', true);

	expect(window.location.search).toStrictEqual('?key2=value2');

	query.delete('key2', true);

	expect(window.location.search).toStrictEqual('');
});
