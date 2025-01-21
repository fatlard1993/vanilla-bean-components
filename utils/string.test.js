import { capitalize, fromCamelCase, removeExcessIndentation, toCamelCase } from './string';

test('capitalize', () => {
	expect(capitalize('test')).toStrictEqual('Test');
});

test('fromCamelCase', () => {
	expect(fromCamelCase('camelCase')).toStrictEqual('camel Case');
});

test('toCamelCase', () => {
	expect(toCamelCase('camel case')).toStrictEqual('camelCase');
});

test('removeExcessIndentation', () => {
	expect(removeExcessIndentation('\t\t\t\t\t\t\ttest')).toStrictEqual('test');

	expect(removeExcessIndentation(`\t\t{\n\t\t\t\tkey: value,\n\t\t}`)).toStrictEqual('{\n\t\tkey: value,\n}');
});
