import fonts from './fonts';
import theme from '.';

describe('font roles', () => {
	afterEach(() => {
		fonts.family.body = undefined;
		fonts.family.code = undefined;
		fonts.family.display = undefined;
	});

	test("each role has today's family until it's given its own", () => {
		expect(fonts.family.body).toBe("'Kode Mono Variable', monospace");
		expect(fonts.family.code).toBe('"FontWithASyntaxHighlighter", monospace');
		expect(fonts.family.display).toBe(fonts.family.body);
		expect(fonts.family.hasDisplay).toBe(false);
	});

	test('the page text and the code look are drawn from the body and code roles', () => {
		fonts.family.body = 'Georgia, serif';
		fonts.family.code = 'Menlo, monospace';

		expect(fonts.kodeMono).toContain('font-family: Georgia, serif;');
		expect(fonts.code).toContain('font-family: Menlo, monospace;');
		expect(theme.page).toContain('font-family: Georgia, serif;');
	});

	test('headings take the display role only once it has a family of its own', () => {
		expect(theme.page).not.toContain('Press Start 2P');

		fonts.family.display = "'Press Start 2P', monospace";

		expect(fonts.family.hasDisplay).toBe(true);
		expect(theme.page).toContain("font-family: 'Press Start 2P', monospace;");
	});

	test('assigning undefined hands a role back', () => {
		fonts.family.display = 'Impact';
		fonts.family.display = undefined;

		expect(fonts.family.display).toBe(fonts.family.body);
		expect(fonts.family.hasDisplay).toBe(false);
	});
});
