import { requestMatch } from './requestMatch';

const request = (path, method = 'GET') => new Request(`http://localhost${path}`, { method });

describe('requestMatch', () => {
	test('matches a static path', () => {
		expect(requestMatch('GET', '/games', request('/games'))).toEqual({});
	});

	test('returns named segments, decoded', () => {
		expect(requestMatch('GET', '/games/:id/players/:name', request('/games/12/players/a%20b'))).toEqual({
			id: '12',
			name: 'a b',
		});
	});

	test('includes search params', () => {
		expect(requestMatch('GET', '/games/:id', request('/games/12?sort=name'))).toEqual({ id: '12', sort: 'name' });
	});

	test('does not match another method', () => {
		expect(requestMatch('POST', '/games', request('/games'))).toBe(false);
	});

	test('matches the whole path, not a prefix or suffix', () => {
		expect(requestMatch('GET', '/games/:id', request('/games/12/join'))).toBe(false);
		expect(requestMatch('GET', '/games/:id', request('/api/games/12'))).toBe(false);
	});

	test('treats pattern characters literally', () => {
		expect(requestMatch('GET', '/file.json', request('/file.json'))).toEqual({});
		expect(requestMatch('GET', '/file.json', request('/file-json'))).toBe(false);
	});

	test('does not match a segment that cannot be decoded', () => {
		expect(requestMatch('GET', '/games/:id', request('/games/%E0%A4%A'))).toBe(false);
	});
});
