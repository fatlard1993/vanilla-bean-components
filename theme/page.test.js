import theme from '.';

describe('theme.page and theme.elements', () => {
	// Top-level rules sit one tab in; nested ones (code inside a language- block) sit deeper
	const rule = (css, selector) =>
		new RegExp(`^\\t${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`, 'm').test(css);

	test('bare elements are styled by theme.elements, not by the page', () => {
		for (const selector of [
			'h1, h2, h3, h4, h5, h6',
			'a',
			'code',
			'input, select, textarea',
			'button',
			'kbd',
			'table',
			'blockquote',
		]) {
			expect(rule(theme.elements, selector)).toBe(true);
			expect(rule(theme.page, selector)).toBe(false);
		}
	});

	test("typed fields' rules weigh no more than a bare element, so an app's class still wins over them", () => {
		for (const type of ['number', 'checkbox']) {
			expect(rule(theme.elements, `input:where([type='${type}'])`)).toBe(true);
			expect(rule(theme.elements, `input[type='${type}']`)).toBe(false);
		}
	});

	test('an Input of a typed kind keeps its look by class too, at no specificity', () => {
		for (const type of ['number', 'checkbox']) {
			expect(rule(theme.page, `:where(.vbc-input[type='${type}'])`)).toBe(true);
		}
	});

	test("a hidden tab panel stays hidden, whatever display the app's own styling gives it", () => {
		expect(theme.page).toMatch(/\.vbc-tabpanel\[hidden\]\s*\{\s*display: none !important;/);
	});

	test('a vbc-elements container gets the element styles whether or not the page does', () => {
		expect(rule(theme.page, ':where(.vbc-elements)')).toBe(true);
		expect(theme.page).toContain(`\t${theme.elements.trim().split('\n')[0]}`);
	});

	test("the page keeps the library components' looks, at no specificity, and the syntax font", () => {
		for (const selector of [':where(.vbc-button)', ':where(.vbc-input)', ':where(.vbc-table)', 'a.variant-button']) {
			expect(rule(theme.page, selector)).toBe(true);
		}

		expect(theme.page).toContain('@font-face');
		expect(theme.page).toContain('code[class*="language-"]');
	});

	test('a visited link drawn as a button keeps the button text, not the visited purple', () => {
		const visited = theme.page.match(/^\ta\.variant-button:visited:not\(\.disabled, [^)]*\) \{([^}]*)\}/m)?.[1];

		expect(visited).toContain(`color: ${theme.colors.white};`);
	});

	test("a Link drawn flat or as a chip has the Button's look, by a rule that outweighs a:visited", () => {
		expect(theme.page).toContain('a.variant-button.variant-flat {');
		expect(theme.page).toContain('a.variant-button.variant-chip {');
	});
});

describe('theme colors named for their job', () => {
	test('surface, overlay and warning', () => {
		expect(theme.colors.surface.toHslString()).toBe(theme.colors.darker(theme.colors.gray).toHslString());
		expect(theme.colors.overlay.getAlpha()).toBe(0.6);
		expect(theme.colors.warning).toBe(theme.colors.yellow);
	});
});

describe('theme.safeArea', () => {
	test('each side is its env() inset, 0px where there is none', () => {
		expect(theme.safeArea).toEqual({
			top: 'env(safe-area-inset-top, 0px)',
			right: 'env(safe-area-inset-right, 0px)',
			bottom: 'env(safe-area-inset-bottom, 0px)',
			left: 'env(safe-area-inset-left, 0px)',
		});
	});
});

describe('the focus ring', () => {
	test('is one ring in the selected role, on keyboard focus, for anything the page focuses and for the controls', () => {
		const ring = theme.focusRing();

		expect(ring).toContain(`outline: 2px solid ${theme.colors.light(theme.colors.selected)};`);
		expect(ring).toContain('outline-offset: 2px;');
		expect(theme.focusRing('-2px')).toContain('outline-offset: -2px;');
		expect(theme.page).toMatch(/:where\(:focus-visible\) \{\s*outline: 2px solid/);
		expect(theme.input).toContain(ring.trim().split('\n')[0]);
	});
});

describe('the type scale', () => {
	test('headings step through it', () => {
		const size = selector => theme.elements.match(new RegExp(`^\\t${selector} \\{[^}]*?font-size: ([^;]+);`, 'm'))?.[1];

		expect(size('h1')).toBe(theme.fontSize.xxl);
		expect(size('h2')).toBe(theme.fontSize.xl);
		expect(size('h3')).toBe(theme.fontSize.lg);
	});
});

describe('motion', () => {
	test('asked for less, the page stills every transition and animation, once, for everything', () => {
		const reduced = theme.page.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\t\}/)?.[1];

		expect(reduced).toContain('transition-duration: 0.01ms !important;');
		expect(reduced).toContain('animation-iteration-count: 1 !important;');
	});

	test('no transition is of everything', () => {
		expect(theme.page).not.toMatch(/transition: all/);
	});
});
