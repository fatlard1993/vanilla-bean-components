import { removeExcessIndentation } from './string';

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
