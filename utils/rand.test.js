import { rand, randInt, randFromArray } from './rand';

test('rand', () => {
	expect(typeof rand()).toStrictEqual('number');
});

test('randInt', () => {
	expect(Number.isInteger(randInt())).toStrictEqual(true);
});

test('randFromArray', () => {
	expect(typeof randFromArray(['one', '2', 'three'])).toStrictEqual('string');
});
