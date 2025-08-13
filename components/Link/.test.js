import { findByRole } from '@testing-library/dom';

import { Link } from '.';

describe('Link', () => {
	test('must render', async () => {
		const textContent = 'textContent';
		const href = 'testHref';

		new Link({ textContent, href, appendTo: container });

		const link = await findByRole(container, 'link', { name: textContent });

		expect(link.href).toContain(href);
	});

	test('renders with default anchor tag', () => {
		const link = new Link({
			textContent: 'Test Link',
			href: '/test',
			appendTo: container,
		});

		expect(link.elem.tagName).toBe('A');
		expect(link.elem.href).toContain('/test');
		expect(link.elem.textContent).toBe('Test Link');
	});

	test('sets variant classes correctly', () => {
		const linkVariant = new Link({
			textContent: 'Link Variant',
			variant: 'link',
			appendTo: container,
		});

		expect(linkVariant.elem.className).toContain('variant-link');

		const buttonVariant = new Link({
			textContent: 'Button Variant',
			variant: 'button',
			appendTo: container,
		});

		expect(buttonVariant.elem.className).toContain('variant-button');
	});

	test('changes variant classes when updated', () => {
		const link = new Link({
			textContent: 'Test',
			variant: 'link',
			appendTo: container,
		});

		expect(link.elem.className).toContain('variant-link');

		link.options.variant = 'button';

		expect(link.elem.className).not.toContain('variant-link');
		expect(link.elem.className).toContain('variant-button');
	});

	test('extends TooltipWrapper with default tooltip', () => {
		const link = new Link({
			textContent: 'Test Link',
			appendTo: container,
		});

		expect(link.options.tooltip).toBeDefined();
		expect(link.options.tooltip.icon).toBe('link');
		expect(link.options.tooltip.style.fontSize).toBe('12px');
	});

	test('supports variant enum values', () => {
		const link = new Link({ appendTo: container });

		expect(link.variant_enum).toContain('link');
		expect(link.variant_enum).toContain('button');
		expect(link.variant_enum).toHaveLength(2);
	});

	test('accepts custom href and target attributes', () => {
		const link = new Link({
			textContent: 'External Link',
			href: 'https://example.com',
			attributes: {
				target: '_blank',
				rel: 'noopener',
			},
			appendTo: container,
		});

		expect(link.elem.href).toBe('https://example.com/');
		expect(link.elem.getAttribute('target')).toBe('_blank');
		expect(link.elem.getAttribute('rel')).toBe('noopener');
	});
});
