import { capitalize, fromCamelCase, toCamelCase, removeExcessIndentation } from './string';

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

	expect(
		removeExcessIndentation(`
			test
		`),
	).toStrictEqual('test');

	expect(
		removeExcessIndentation(`
			test {
				indented!
			}
		`),
	).toStrictEqual('test {\n\tindented!\n}');
});
