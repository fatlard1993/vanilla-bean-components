import { TinyColor } from '@ctrl/tinycolor';
import theme from '.';

const ORIGINAL_BLUE = 'hsl(209, 55%, 45%)';
const ORIGINAL_YELLOW = 'hsl(44, 55%, 45%)';
const ORIGINAL_GRAY = 'hsl(0, 0%, 45%)';

afterEach(() => {
	theme.colors.blue = new TinyColor(ORIGINAL_BLUE);
	theme.colors.yellow = new TinyColor(ORIGINAL_YELLOW);
	theme.colors.gray = new TinyColor(ORIGINAL_GRAY);
	theme.colors.selected = undefined;
});

describe('theme colors', () => {
	test('base colors are writable', () => {
		const before = theme.colors.blue.toString();
		theme.colors.blue = new TinyColor('hsl(120, 55%, 45%)');
		expect(theme.colors.blue.toString()).not.toBe(before);
	});

	test('white derives from gray — updates when gray is reassigned', () => {
		const before = theme.colors.white.toString();
		theme.colors.gray = new TinyColor('hsl(200, 30%, 45%)');
		expect(theme.colors.white.toString()).not.toBe(before);
	});

	test('selected follows yellow — updates when yellow is reassigned', () => {
		const custom = new TinyColor('hsl(120, 55%, 45%)');
		theme.colors.yellow = custom;
		expect(theme.colors.selected.toString()).toBe(custom.toString());
	});

	test('selected can be assigned independently of yellow', () => {
		const custom = new TinyColor('hsl(280, 55%, 45%)');
		theme.colors.selected = custom;
		expect(theme.colors.selected.toString()).toBe(custom.toString());
		expect(theme.colors.yellow.toString()).toBe(new TinyColor(ORIGINAL_YELLOW).toString());
	});
});

describe('theme lazy strings', () => {
	test('theme.button reflects a color mutation', () => {
		const custom = new TinyColor('hsl(120, 55%, 45%)');
		theme.colors.blue = custom;
		expect(theme.button).toContain(custom.toString());
	});

	test('theme.table reflects a color mutation', () => {
		const before = theme.table;
		theme.colors.yellow = new TinyColor('hsl(120, 55%, 45%)');
		expect(theme.table).not.toBe(before);
	});

	test('theme.scrollbar reflects a color mutation', () => {
		const custom = new TinyColor('hsl(120, 55%, 45%)');
		theme.colors.yellow = custom;
		expect(theme.scrollbar).toContain(custom.toString());
	});

	test('theme.input reflects a color mutation', () => {
		const custom = new TinyColor('hsl(120, 55%, 45%)');
		theme.colors.yellow = custom;
		expect(theme.input).toContain(custom.toString());
	});

	test('theme.code reflects a color mutation', () => {
		const before = theme.code;
		theme.colors.blue = new TinyColor('hsl(120, 55%, 45%)');
		expect(theme.code).not.toBe(before);
	});

	test('theme.page reflects a color mutation', () => {
		const before = theme.page;
		theme.colors.blue = new TinyColor('hsl(120, 55%, 45%)');
		expect(theme.page).not.toBe(before);
	});

	test('two accesses with a mutation between return different strings', () => {
		const before = theme.button;
		theme.colors.blue = new TinyColor('hsl(120, 55%, 45%)');
		const after = theme.button;
		expect(before).not.toBe(after);
	});
});
