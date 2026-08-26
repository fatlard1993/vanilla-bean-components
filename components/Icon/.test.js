import { Icon } from '.';

describe('Icon', () => {
	test('renders with default div tag', () => {
		const icon = new Icon({ appendTo: container });

		expect(icon.elem.tagName).toBe('DIV');
		expect(container.children).toHaveLength(1);
	});

	test('sets icon classes correctly', () => {
		const icon = new Icon({
			icon: 'home',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('icon');
		expect(icon.elem.className).toContain('fa-home');
		expect(icon.elem.className).toContain('fa-support');
	});

	test('sets animation classes correctly', () => {
		const icon = new Icon({
			icon: 'spinner',
			animation: 'spin',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('fa-spinner');
		expect(icon.elem.className).toContain('fa-spin');
		expect(icon.elem.className).toContain('fa-support');
	});

	test('does not add icon class when content is provided', () => {
		const icon = new Icon({
			icon: 'home',
			textContent: 'Home',
			appendTo: container,
		});

		expect(icon.elem.className).not.toContain('icon');
		expect(icon.elem.className).toContain('fa-home');
		expect(icon.elem.textContent).toBe('Home');
	});

	test('removes previous classes when icon changes', () => {
		const icon = new Icon({
			icon: 'home',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('fa-home');

		icon.options.icon = 'user';

		expect(icon.elem.className).not.toContain('fa-home');
		expect(icon.elem.className).toContain('fa-user');
	});

	test('removes previous classes when animation changes', () => {
		const icon = new Icon({
			icon: 'spinner',
			animation: 'spin',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('fa-spin');
		expect(icon.elem.className).toContain('fa-spinner');

		icon.options.animation = 'pulse';

		// Should contain the new animation and still have the icon
		expect(icon.elem.className).toContain('fa-pulse');
		expect(icon.elem.className).toContain('fa-spinner');
		// Verify the class string doesn't contain fa-spin anymore
		const classes = icon.elem.className.split(' ');
		expect(classes).not.toContain('fa-spin');
	});

	test('handles both icon and animation together', () => {
		const icon = new Icon({
			icon: 'heart',
			animation: 'beat',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('fa-heart');
		expect(icon.elem.className).toContain('fa-beat');
		expect(icon.elem.className).toContain('fa-support');
	});

	test('clears icon classes when set to falsy value', () => {
		const icon = new Icon({
			icon: 'home',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('fa-home');

		icon.options.icon = '';

		expect(icon.elem.className).not.toContain('fa-home');
		expect(icon.elem.className).not.toContain('fa-support');
	});

	test('sets an icon animation class without touching the element animation', () => {
		const icon = new Icon({
			icon: 'spinner',
			iconAnimation: 'spin',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('icon-animation-spin');
		expect(icon.elem.className).toContain('fa-spinner');
		// fa-spin is what animates the element itself, so an icon animation must not add it —
		// that separation is the whole point of the option.
		expect(icon.elem.className.split(' ')).not.toContain('fa-spin');
	});

	test('animates the element and the glyph independently', () => {
		const icon = new Icon({
			icon: 'spinner',
			animation: 'beat',
			iconAnimation: 'spin',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('fa-beat');
		expect(icon.elem.className).toContain('icon-animation-spin');
	});

	test('removes previous classes when the icon animation changes', () => {
		const icon = new Icon({
			icon: 'spinner',
			iconAnimation: 'spin-pulse',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('icon-animation-spin-pulse');

		icon.options.iconAnimation = 'bounce';

		expect(icon.elem.className).toContain('icon-animation-bounce');
		expect(icon.elem.className.split(' ')).not.toContain('icon-animation-spin-pulse');
	});

	test('clears the icon animation class when set to a falsy value', () => {
		const icon = new Icon({
			icon: 'spinner',
			iconAnimation: 'spin',
			appendTo: container,
		});

		icon.options.iconAnimation = '';

		expect(icon.elem.className).not.toContain('icon-animation-');
		expect(icon.elem.className).toContain('fa-spinner');
	});

	test('an icon animation alone does not make it an icon-only element', () => {
		const icon = new Icon({
			icon: 'spinner',
			iconAnimation: 'spin',
			textContent: 'Saving',
			appendTo: container,
		});

		expect(icon.elem.className).toContain('icon-animation-spin');
		expect(icon.elem.className.split(' ')).not.toContain('icon');
	});
});
