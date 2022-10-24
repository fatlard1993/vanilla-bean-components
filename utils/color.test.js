import { stringToColor } from './color';

test('stringToColor', () => {
	expect(stringToColor('words for color')).toStrictEqual('hsl(181, 76%, 41%)');

	expect(stringToColor('color is based on source text')).toStrictEqual('hsl(71, 86%, 51%)');
});
