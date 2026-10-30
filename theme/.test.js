import { TinyColor } from '@ctrl/tinycolor';
import theme from '.';

const { blue, yellow, gray } = theme.colors;

afterEach(() => {
	Object.assign(theme.colors, { blue, yellow, gray, selected: undefined });
});

describe('theme colors', () => {
	test('base colors are writable', () => {
		const before = theme.colors.blue.toString();
		theme.colors.blue = new TinyColor('hsl(120, 55%, 45%)');
		expect(theme.colors.blue.toString()).not.toBe(before);
	});

	test('white derives from gray - updates when gray is reassigned', () => {
		const before = theme.colors.white.toString();
		theme.colors.gray = new TinyColor('hsl(200, 30%, 45%)');
		expect(theme.colors.white.toString()).not.toBe(before);
	});

	test('selected follows yellow - updates when yellow is reassigned', () => {
		const custom = new TinyColor('hsl(120, 55%, 45%)');
		theme.colors.yellow = custom;
		expect(theme.colors.selected.toString()).toBe(custom.toString());
	});

	test('selected can be assigned independently of yellow', () => {
		const custom = new TinyColor('hsl(280, 55%, 45%)');
		theme.colors.selected = custom;
		expect(theme.colors.selected.toString()).toBe(custom.toString());
		expect(theme.colors.yellow).toBe(yellow);
	});
});

describe('theme lazy strings', () => {
	test('theme.input reflects a color mutation', () => {
		const custom = new TinyColor('hsl(120, 55%, 45%)');
		theme.colors.yellow = custom;
		expect(theme.input).toContain(custom.toString());
	});

	test('theme.page reflects a color mutation', () => {
		const before = theme.page;
		theme.colors.blue = new TinyColor('hsl(120, 55%, 45%)');
		expect(theme.page).not.toBe(before);
	});

	test('two accesses with a mutation between return different strings', () => {
		const before = theme.elements;
		theme.colors.blue = new TinyColor('hsl(120, 55%, 45%)');
		const after = theme.elements;
		expect(before).not.toBe(after);
	});
});
