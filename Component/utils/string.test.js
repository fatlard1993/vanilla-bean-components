import { removeExcessIndentation } from './string';

test('removeExcessIndentation', () => {
	expect(removeExcessIndentation('\t\t\t\t\t\t\ttest')).toStrictEqual('test');

	expect(removeExcessIndentation(`\t\t{\n\t\t\t\tkey: value,\n\t\t}`)).toStrictEqual('{\n\t\tkey: value,\n}');
});
