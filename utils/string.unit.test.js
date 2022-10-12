import { expect, test } from 'vitest';

import { capitalize, fromCamelCase, toCamelCase } from './string';

test('capitalize', () => {
	expect(capitalize('test')).toStrictEqual('Test');
});

test('fromCamelCase', () => {
	expect(fromCamelCase('camelCase')).toStrictEqual('camel Case');
});

test('toCamelCase', () => {
	expect(toCamelCase('camel case')).toStrictEqual('camelCase');
});
