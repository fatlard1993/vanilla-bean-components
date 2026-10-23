import { pathMatch } from './pathMatch';

describe('pathMatch', () => {
	test('a static pattern matches itself, with nothing named', () => {
		expect(pathMatch('/games', '/games')).toEqual({});
		expect(pathMatch('/games', '/games/12')).toBeNull();
	});

	test('regex characters in a pattern are literal', () => {
		expect(pathMatch('/files/(draft)+.json', '/files/(draft)+.json')).toEqual({});
		expect(pathMatch('/files/(draft)+.json', '/files/draft-json')).toBeNull();
		expect(pathMatch('/v1.2/:id', '/v1x2/7')).toBeNull();
	});

	test('a named segment comes back decoded', () => {
		expect(pathMatch('/tags/:tag/:page', '/tags/rock%20%26%20roll/2')).toEqual({ tag: 'rock & roll', page: '2' });
	});

	test('a named segment is one segment', () => {
		expect(pathMatch('/users/:id', '/users/42/edit')).toBeNull();
		expect(pathMatch('/users/:id', `/users/${encodeURIComponent('a/b')}`)).toEqual({ id: 'a/b' });
	});

	test('a value that is not valid encoding does not match', () => {
		expect(pathMatch('/users/:id', '/users/%E0%A4%A')).toBeNull();
	});
});
