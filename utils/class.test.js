import { buildClassList, buildClassName } from './class';

test('buildClassList', () => {
	expect(buildClassList('one', 'two', 'two', 3)).toStrictEqual(['one', 'two']);
});

test('buildClassName', () => {
	expect(buildClassName('one', 'two', 'two', 3)).toStrictEqual('one two');
});
