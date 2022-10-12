import { expect, test } from 'vitest';

import { randomRGB, hsvToRGB, toHSV, hslToHSV, rgbToHSV, decToRGB, stringToColor, getOppositeHue } from './color';

const hsv = {
	h: 73.98496240601503,
	s: 0.6129032258064515,
	v: 0.8509803921568627,
};
const rgb = 'rgb(186, 217, 84)';
const hsl = 'hsl(74deg 64% 59%)';
const hex = '#bada55';

test('randomRGB', () => {
	expect(randomRGB()).toMatch(/#[a-f0-9]{6}/i);
});

test('hsvToRGB', () => {
	expect(hsvToRGB(hsv)).toStrictEqual(rgb);
});

test.skip('toHSV', () => {
	expect(toHSV(rgb)).toStrictEqual(hsv);
	expect(toHSV(hsl)).toStrictEqual(hsv);
	expect(toHSV(hex)).toStrictEqual(hsv);
});

test.skip('hslToHSV', () => {
	expect(hslToHSV(74, 64, 59)).toStrictEqual(hsv);
});

test('rgbToHSV', () => {
	expect(rgbToHSV(186, 217, 84)).toStrictEqual(hsv);
});

test('decToRGB', () => {
	expect(decToRGB(65535)).toStrictEqual('rgb(255, 255, 0)');
});

test('stringToColor', () => {
	expect(stringToColor('test')).toStrictEqual('hsl(58, 98%, 58%)');
});

test('getOppositeHue', () => {
	expect(getOppositeHue(hsl)).toStrictEqual('hsl(254, 100%, 30%)');
});
