import { buildClassList, buildClassName } from './class';

test('buildClassList', () => {
	expect(buildClassList('one', 'two', 'two', 3)).toStrictEqual(['one', 'two']);

	expect(buildClassList([[['one', 'two']]], 'three', ['four', [['five']]])).toStrictEqual([
		'one',
		'two',
		'three',
		'four',
		'five',
	]);
});

test('buildClassName', () => {
	expect(buildClassName('one', 'two', 'two', 3)).toStrictEqual('one two');
});
