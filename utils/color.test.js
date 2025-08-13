import { stringToColor, rgbDelta } from './color';

describe('color utilities', () => {
	describe('stringToColor', () => {
		test('generates consistent colors for same string', () => {
			const color1 = stringToColor('test');
			const color2 = stringToColor('test');

			expect(color1).toBe(color2);
			expect(typeof color1).toBe('string');
		});

		test('generates different colors for different strings', () => {
			const color1 = stringToColor('test1');
			const color2 = stringToColor('test2');
			const color3 = stringToColor('different');

			expect(color1).not.toBe(color2);
			expect(color2).not.toBe(color3);
			expect(color1).not.toBe(color3);
		});

		test('returns valid HSL color format', () => {
			const color = stringToColor('test string');

			expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
		});

		test('uses default constraints when no config provided', () => {
			const color = stringToColor('test');

			const match = color.match(/^hsl\((\d+), (\d+)%, (\d+)%\)$/);
			expect(match).toBeTruthy();

			const [, h, s, l] = match.map(Number);
			expect(h).toBeGreaterThanOrEqual(0);
			expect(h).toBeLessThanOrEqual(360);
			expect(s).toBeGreaterThanOrEqual(75);
			expect(s).toBeLessThanOrEqual(100);
			expect(l).toBeGreaterThanOrEqual(40);
			expect(l).toBeLessThanOrEqual(60);
		});

		test('respects custom hue constraints', () => {
			const reddish = stringToColor('test', { h: [0, 60] });
			const greenish = stringToColor('test', { h: [120, 180] });
			const blueish = stringToColor('test', { h: [240, 300] });

			const parseHue = color => {
				const match = color.match(/^hsl\((\d+),/);
				return parseInt(match[1]);
			};

			const redHue = parseHue(reddish);
			const greenHue = parseHue(greenish);
			const blueHue = parseHue(blueish);

			expect(redHue).toBeGreaterThanOrEqual(0);
			expect(redHue).toBeLessThanOrEqual(60);
			expect(greenHue).toBeGreaterThanOrEqual(120);
			expect(greenHue).toBeLessThanOrEqual(180);
			expect(blueHue).toBeGreaterThanOrEqual(240);
			expect(blueHue).toBeLessThanOrEqual(300);
		});

		test('respects custom saturation constraints', () => {
			const lowSat = stringToColor('test', { s: [10, 30] });
			const highSat = stringToColor('test', { s: [90, 100] });

			const parseSaturation = color => {
				const match = color.match(/^hsl\(\d+, (\d+)%,/);
				return parseInt(match[1]);
			};

			const lowS = parseSaturation(lowSat);
			const highS = parseSaturation(highSat);

			expect(lowS).toBeGreaterThanOrEqual(10);
			expect(lowS).toBeLessThanOrEqual(30);
			expect(highS).toBeGreaterThanOrEqual(90);
			expect(highS).toBeLessThanOrEqual(100);
		});

		test('respects custom lightness constraints', () => {
			const dark = stringToColor('test', { l: [10, 30] });
			const light = stringToColor('test', { l: [70, 90] });

			const parseLightness = color => {
				const match = color.match(/^hsl\(\d+, \d+%, (\d+)%\)$/);
				return parseInt(match[1]);
			};

			const darkL = parseLightness(dark);
			const lightL = parseLightness(light);

			expect(darkL).toBeGreaterThanOrEqual(10);
			expect(darkL).toBeLessThanOrEqual(30);
			expect(lightL).toBeGreaterThanOrEqual(70);
			expect(lightL).toBeLessThanOrEqual(90);
		});

		test('handles complex configuration', () => {
			const config = {
				h: [200, 260],
				s: [80, 95],
				l: [45, 55],
			};

			const color = stringToColor('complex test', config);
			const match = color.match(/^hsl\((\d+), (\d+)%, (\d+)%\)$/);
			const [, h, s, l] = match.map(Number);

			expect(h).toBeGreaterThanOrEqual(200);
			expect(h).toBeLessThanOrEqual(260);
			expect(s).toBeGreaterThanOrEqual(80);
			expect(s).toBeLessThanOrEqual(95);
			expect(l).toBeGreaterThanOrEqual(45);
			expect(l).toBeLessThanOrEqual(55);
		});

		test('handles empty string input', () => {
			const color = stringToColor('');

			expect(typeof color).toBe('string');

			expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
		});

		test('handles very long strings', () => {
			const longString = 'a'.repeat(1000);
			const color = stringToColor(longString);

			expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
		});

		test('handles special characters and unicode', () => {
			const specialString = '🚀💡🎨 Special chars: !@#$%^&*()';
			const unicodeString = 'ñáéíóú 中文 العربية';

			const color1 = stringToColor(specialString);
			const color2 = stringToColor(unicodeString);

			expect(color1).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
			expect(color2).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
			expect(color1).not.toBe(color2);
		});

		test('produces deterministic hash-based colors', () => {
			const iterations = 10;
			const testString = 'deterministic test';
			const colors = Array.from({ length: iterations }, () => stringToColor(testString));

			expect(colors.every(color => color === colors[0])).toBe(true);
		});

		test('handles reversed constraint ranges', () => {
			const color = stringToColor('test', { h: [300, 60] });

			expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
		});

		test('handles null and undefined gracefully', () => {
			const color1 = stringToColor(null);
			const color2 = stringToColor(undefined);

			expect(color1).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
			expect(color2).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
		});

		test('handles numeric input', () => {
			const color1 = stringToColor(42);
			const color2 = stringToColor(0);

			expect(color1).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);

			expect(color2).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
		});
	});

	describe('rgbDelta', () => {
		test('calculates delta between identical colors', () => {
			const black = [0, 0, 0];
			const sameBlack = [0, 0, 0];

			const delta = rgbDelta(black, sameBlack);
			expect(delta).toBe(0);
		});

		test('calculates delta between different colors', () => {
			const black = [0, 0, 0];
			const white = [255, 255, 255];
			const red = [255, 0, 0];
			const green = [0, 255, 0];

			const blackWhiteDelta = rgbDelta(black, white);
			const blackRedDelta = rgbDelta(black, red);
			const redGreenDelta = rgbDelta(red, green);

			expect(blackWhiteDelta).toBeGreaterThan(0);
			expect(blackRedDelta).toBeGreaterThan(0);
			expect(redGreenDelta).toBeGreaterThan(0);

			expect(blackWhiteDelta).toBeGreaterThan(50);
			expect(blackRedDelta).toBeGreaterThan(50);
			expect(redGreenDelta).toBeGreaterThan(50);
		});

		test('calculates delta between similar colors', () => {
			const lightRed = [255, 200, 200];
			const slightlyDarkerRed = [250, 195, 195];

			const delta = rgbDelta(lightRed, slightlyDarkerRed);
			expect(delta).toBeGreaterThan(0);
			expect(delta).toBeLessThan(10);
		});

		test('handles edge case RGB values', () => {
			const min = [0, 0, 0];
			const max = [255, 255, 255];
			const mid = [128, 128, 128];

			const minMaxDelta = rgbDelta(min, max);
			const minMidDelta = rgbDelta(min, mid);
			const midMaxDelta = rgbDelta(mid, max);

			expect(minMaxDelta).toBeGreaterThan(minMidDelta);
			expect(minMaxDelta).toBeGreaterThan(midMaxDelta);
		});

		test('returns finite positive numbers', () => {
			const color1 = [123, 45, 67];
			const color2 = [89, 234, 156];

			const delta = rgbDelta(color1, color2);

			expect(isFinite(delta)).toBe(true);
			expect(delta).toBeGreaterThanOrEqual(0);
		});

		test('handles grayscale colors correctly', () => {
			const darkGray = [50, 50, 50];
			const lightGray = [200, 200, 200];
			const mediumGray = [128, 128, 128];

			const darkLightDelta = rgbDelta(darkGray, lightGray);
			const darkMediumDelta = rgbDelta(darkGray, mediumGray);
			const mediumLightDelta = rgbDelta(mediumGray, lightGray);

			expect(darkLightDelta).toBeGreaterThan(darkMediumDelta);
			expect(darkLightDelta).toBeGreaterThan(mediumLightDelta);
		});

		test('handles primary colors correctly', () => {
			const red = [255, 0, 0];
			const green = [0, 255, 0];
			const blue = [0, 0, 255];
			const yellow = [255, 255, 0];
			const cyan = [0, 255, 255];
			const magenta = [255, 0, 255];

			expect(rgbDelta(red, green)).toBeGreaterThan(50);
			expect(rgbDelta(red, blue)).toBeGreaterThan(50);
			expect(rgbDelta(green, blue)).toBeGreaterThan(50);

			expect(rgbDelta(red, yellow)).toBeLessThan(rgbDelta(red, green));
			expect(rgbDelta(green, cyan)).toBeLessThan(rgbDelta(green, red));
			expect(rgbDelta(blue, magenta)).toBeLessThan(rgbDelta(blue, green));
		});

		test('handles floating point RGB values', () => {
			const color1 = [123.5, 45.7, 67.9];
			const color2 = [89.1, 234.8, 156.2];

			const delta = rgbDelta(color1, color2);

			expect(isFinite(delta)).toBe(true);
			expect(delta).toBeGreaterThan(0);
		});

		test('handles out-of-range RGB values gracefully', () => {
			const overRange = [300, 400, 500];
			const underRange = [-50, -100, -25];
			const normal = [128, 128, 128];

			expect(() => rgbDelta(overRange, normal)).not.toThrow();
			expect(() => rgbDelta(underRange, normal)).not.toThrow();
			expect(() => rgbDelta(overRange, underRange)).not.toThrow();

			const delta1 = rgbDelta(overRange, normal);
			const delta2 = rgbDelta(underRange, normal);

			expect(isFinite(delta1)).toBe(true);
			expect(isFinite(delta2)).toBe(true);
		});

		test('demonstrates asymmetry in delta calculation', () => {
			const colorA = [100, 150, 200];
			const colorB = [200, 100, 50];

			const deltaAB = rgbDelta(colorA, colorB);
			const deltaBA = rgbDelta(colorB, colorA);

			expect(deltaAB).toBeGreaterThan(0);
			expect(deltaBA).toBeGreaterThan(0);
		});

		test('shows relative ordering consistency', () => {
			const red = [255, 0, 0];
			const darkRed = [128, 0, 0];
			const black = [0, 0, 0];

			const redDarkRedDelta = rgbDelta(red, darkRed);
			const redBlackDelta = rgbDelta(red, black);
			const darkRedBlackDelta = rgbDelta(darkRed, black);

			expect(redDarkRedDelta).toBeLessThan(redBlackDelta);

			expect(darkRedBlackDelta).toBeLessThan(redBlackDelta);
		});
	});

	describe('integration and real-world scenarios', () => {
		test('stringToColor produces colors with good contrast potential', () => {
			const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
			const colors = users.map(name => stringToColor(name));

			colors.forEach(color => {
				expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
			});

			const uniqueColors = new Set(colors);
			expect(uniqueColors.size).toBe(users.length);
		});

		test('color generation for user avatars', () => {
			const userEmails = ['john@example.com', 'bob@test.org', 'charlie@domain.net', 'gym@company.co', 'all@startup.io'];

			const avatarColors = userEmails.map(email =>
				stringToColor(email, {
					h: [0, 360],
					s: [60, 90],
					l: [45, 65],
				}),
			);

			avatarColors.forEach(color => {
				const match = color.match(/^hsl\((\d+), (\d+)%, (\d+)%\)$/);
				const [, h, s, l] = match.map(Number);

				expect(h).toBeGreaterThanOrEqual(0);
				expect(h).toBeLessThanOrEqual(360);
				expect(s).toBeGreaterThanOrEqual(60);
				expect(s).toBeLessThanOrEqual(90);
				expect(l).toBeGreaterThanOrEqual(45);
				expect(l).toBeLessThanOrEqual(65);
			});
		});

		test('color similarity detection using rgbDelta', () => {
			const red = [255, 0, 0];
			const orange = [255, 128, 0];
			const blue = [0, 0, 255];

			const redOrangeDelta = rgbDelta(red, orange);
			const redBlueDelta = rgbDelta(red, blue);

			expect(redOrangeDelta).toBeLessThan(redBlueDelta);
		});

		test('theme color generation', () => {
			const brandName = 'MyAwesomeApp';

			const primaryColor = stringToColor(brandName, {
				h: [200, 240],
				s: [70, 90],
				l: [45, 55],
			});

			const secondaryColor = stringToColor(brandName + '_secondary', {
				h: [150, 190],
				s: [60, 80],
				l: [50, 60],
			});

			const accentColor = stringToColor(brandName + '_accent', {
				h: [300, 340],
				s: [80, 100],
				l: [40, 50],
			});

			expect(primaryColor).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
			expect(secondaryColor).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
			expect(accentColor).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);

			expect(primaryColor).not.toBe(secondaryColor);
			expect(secondaryColor).not.toBe(accentColor);
			expect(primaryColor).not.toBe(accentColor);
		});

		test('performance with many color generations', () => {
			const start = Date.now();

			const colors = Array.from({ length: 1000 }, (_, i) =>
				stringToColor(`user-${i}`, {
					h: [0, 360],
					s: [70, 90],
					l: [40, 60],
				}),
			);

			const elapsed = Date.now() - start;

			expect(colors.length).toBe(1000);
			expect(elapsed).toBeLessThan(500);

			colors.forEach(color => {
				expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
			});
		});

		test('color difference measurement for accessibility', () => {
			const white = [255, 255, 255];
			const black = [0, 0, 0];
			const darkGray = [68, 68, 68];
			const lightGray = [247, 247, 247];

			const whiteBlackDelta = rgbDelta(white, black);
			const whiteDarkGrayDelta = rgbDelta(white, darkGray);
			const lightGrayBlackDelta = rgbDelta(lightGray, black);

			expect(whiteBlackDelta).toBeGreaterThan(50);
			expect(whiteDarkGrayDelta).toBeGreaterThan(30);
			expect(lightGrayBlackDelta).toBeGreaterThan(40);
		});

		test('hash collision avoidance', () => {
			const variations = [
				'user1',
				'user2',
				'user3',
				'user4',
				'user5',
				'user_1',
				'user-1',
				'user.1',
				'user@1',
				'User',
				'USER',
				'user ',
				' user',
			];

			const colors = variations.map(string => stringToColor(string));
			const uniqueColors = new Set(colors);

			expect(uniqueColors.size).toBeGreaterThan(variations.length * 0.8);
		});
	});
});
