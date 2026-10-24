import { cssLength, isDescendantOf, firstFocusable } from './element';

describe('element utilities', () => {
	beforeEach(() => {
		document.body.replaceChildren();
	});

	describe('isDescendantOf', () => {
		test('returns true for direct child', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');

			parent.appendChild(child);
			document.body.appendChild(parent);

			expect(isDescendantOf(child, parent)).toBe(true);
		});

		test('returns true for nested descendant', () => {
			const grandParent = document.createElement('div');
			const parent = document.createElement('div');
			const child = document.createElement('span');

			parent.appendChild(child);
			grandParent.appendChild(parent);
			document.body.appendChild(grandParent);

			expect(isDescendantOf(child, grandParent)).toBe(true);
		});

		test('returns false for non-descendants', () => {
			const parent1 = document.createElement('div');
			const parent2 = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');

			parent1.appendChild(child1);
			parent2.appendChild(child2);
			document.body.appendChild(parent1);
			document.body.appendChild(parent2);

			expect(isDescendantOf(child1, parent2)).toBe(false);
			expect(isDescendantOf(child2, parent1)).toBe(false);
		});

		test('returns false for self-comparison', () => {
			const element = document.createElement('div');
			document.body.appendChild(element);

			expect(isDescendantOf(element, element)).toBe(false);
		});

		test('returns false for reverse relationship (parent is not descendant of child)', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');

			parent.appendChild(child);
			document.body.appendChild(parent);

			expect(isDescendantOf(parent, child)).toBe(false);
		});

		test('returns false for sibling elements', () => {
			const parent = document.createElement('div');
			const sibling1 = document.createElement('span');
			const sibling2 = document.createElement('span');

			parent.appendChild(sibling1);
			parent.appendChild(sibling2);
			document.body.appendChild(parent);

			expect(isDescendantOf(sibling1, sibling2)).toBe(false);
			expect(isDescendantOf(sibling2, sibling1)).toBe(false);
		});

		test('handles deeply nested hierarchies', () => {
			const level0 = document.createElement('div');
			const level1 = document.createElement('div');
			const level2 = document.createElement('div');
			const level3 = document.createElement('div');
			const level4 = document.createElement('span');

			level3.appendChild(level4);
			level2.appendChild(level3);
			level1.appendChild(level2);
			level0.appendChild(level1);
			document.body.appendChild(level0);

			expect(isDescendantOf(level4, level0)).toBe(true);
			expect(isDescendantOf(level3, level1)).toBe(true);
			expect(isDescendantOf(level2, level4)).toBe(false);
		});

		test('handles orphaned elements', () => {
			const orphan1 = document.createElement('div');
			const orphan2 = document.createElement('span');

			expect(isDescendantOf(orphan1, orphan2)).toBe(false);
			expect(isDescendantOf(orphan2, orphan1)).toBe(false);
		});

		test('works with document.body as parent', () => {
			const child = document.createElement('div');
			const grandChild = document.createElement('span');

			child.appendChild(grandChild);
			document.body.appendChild(child);

			expect(isDescendantOf(child, document.body)).toBe(true);
			expect(isDescendantOf(grandChild, document.body)).toBe(true);
		});

		test('handles complex DOM structures', () => {
			const article = document.createElement('article');
			const header = document.createElement('header');
			const title = document.createElement('h1');
			const content = document.createElement('div');
			const paragraph = document.createElement('p');
			const link = document.createElement('a');

			link.textContent = 'Read more';
			paragraph.appendChild(link);
			content.appendChild(paragraph);
			header.appendChild(title);
			article.appendChild(header);
			article.appendChild(content);
			document.body.appendChild(article);

			expect(isDescendantOf(link, article)).toBe(true);
			expect(isDescendantOf(paragraph, article)).toBe(true);
			expect(isDescendantOf(title, article)).toBe(true);
			expect(isDescendantOf(link, header)).toBe(false);
			expect(isDescendantOf(title, content)).toBe(false);
		});
	});

	describe('integration scenarios', () => {
		test('isDescendantOf with manually found elements', () => {
			document.body.innerHTML = `
				<section id="main">
					<article>
						<p>Article paragraph with keyword</p>
					</article>
					<aside>
						<p>Sidebar paragraph with keyword</p>
					</aside>
				</section>
			`;

			const mainSection = document.getElementById('main');
			const paragraphs = document.querySelectorAll('p');

			paragraphs.forEach(p => {
				expect(isDescendantOf(p, mainSection)).toBe(true);
			});
		});
	});

	describe('edge cases and error handling', () => {
		test('handles circular references safely', () => {
			const element = document.createElement('div');
			document.body.appendChild(element);

			expect(isDescendantOf(element, element)).toBe(false);
			expect(isDescendantOf(document.body, element)).toBe(false);
		});
	});
});

describe('cssLength', () => {
	test('a number is pixels; a string passes through', () => {
		expect(cssLength(12)).toBe('12px');
		expect(cssLength(0)).toBe('0px');
		expect(cssLength('1rem')).toBe('1rem');
		expect(cssLength(undefined)).toBeUndefined();
	});
});

describe('firstFocusable', () => {
	test('the first element that takes focus, passing over disabled ones and ones out of the tab order', () => {
		const root = document.createElement('div');

		root.innerHTML =
			'<p>text</p><button disabled>off</button><span tabindex="-1">no</span><input id="first" /><a href="#">link</a>';

		expect(firstFocusable(root).id).toBe('first');
		expect(firstFocusable(document.createElement('div'))).toBeNull();
	});
});
