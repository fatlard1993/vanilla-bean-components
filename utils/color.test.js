import { rgbDelta } from './color';

describe('color utilities', () => {
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
		test('color similarity detection using rgbDelta', () => {
			const red = [255, 0, 0];
			const orange = [255, 128, 0];
			const blue = [0, 0, 255];

			const redOrangeDelta = rgbDelta(red, orange);
			const redBlueDelta = rgbDelta(red, blue);

			expect(redOrangeDelta).toBeLessThan(redBlueDelta);
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
	});
});
