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
});
