import { fileAccepted, readFile } from './file';

const file = (name, type, content = 'a,b\n1,2') => new File([content], name, { type });

describe('file', () => {
	test('fileAccepted reads an accept list as the file input does', () => {
		expect(fileAccepted(file('map.csv', 'text/csv'), '.csv,.json')).toBe(true);
		expect(fileAccepted(file('MAP.CSV', ''), '.csv')).toBe(true);
		expect(fileAccepted(file('photo.png', 'image/png'), 'image/*')).toBe(true);
		expect(fileAccepted(file('data.json', 'application/json'), 'application/json')).toBe(true);
		expect(fileAccepted(file('notes.txt', 'text/plain'), '.csv, image/*')).toBe(false);
		expect(fileAccepted(file('anything.bin', ''), '')).toBe(true);
	});

	test('readFile reads text, json and a data url', async () => {
		expect(await readFile(file('a.csv', 'text/csv'))).toBe('a,b\n1,2');
		expect(await readFile(file('a.json', 'application/json', '{"a":1}'), 'json')).toEqual({ a: 1 });
		expect(await readFile(file('a.txt', 'text/plain', 'hi'), 'dataURL')).toStartWith('data:text/plain');
		expect(readFile(file('a.txt', 'text/plain'), 'nonsense')).rejects.toThrow(TypeError);
	});
});
