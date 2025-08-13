import { getElementIndex, isDescendantOf } from './element';

describe('element utilities', () => {
	beforeEach(() => {
		document.body.replaceChildren();
	});

	describe('getElementIndex', () => {
		test('returns 0 for first element', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');

			parent.appendChild(child1);
			parent.appendChild(child2);
			document.body.appendChild(parent);

			expect(getElementIndex(child1)).toBe(0);
		});

		test('returns correct index for subsequent elements', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('p');
			const child3 = document.createElement('div');

			parent.appendChild(child1);
			parent.appendChild(child2);
			parent.appendChild(child3);
			document.body.appendChild(parent);

			expect(getElementIndex(child1)).toBe(0);
			expect(getElementIndex(child2)).toBe(1);
			expect(getElementIndex(child3)).toBe(2);
		});

		test('handles orphaned elements', () => {
			const orphan = document.createElement('div');

			expect(getElementIndex(orphan)).toBe(0);
		});

		test('handles single child correctly', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');

			parent.appendChild(child);
			document.body.appendChild(parent);

			expect(getElementIndex(child)).toBe(0);
		});

		test('ignores text nodes and only counts element siblings', () => {
			const parent = document.createElement('div');
			const textNode = document.createTextNode('text content');
			const child1 = document.createElement('span');
			const child2 = document.createElement('p');

			parent.appendChild(textNode);
			parent.appendChild(child1);
			parent.appendChild(child2);
			document.body.appendChild(parent);

			expect(getElementIndex(child1)).toBe(0);
			expect(getElementIndex(child2)).toBe(1);
		});

		test('handles deeply nested elements', () => {
			const grandParent = document.createElement('div');
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');

			parent.appendChild(child1);
			parent.appendChild(child2);
			grandParent.appendChild(parent);
			document.body.appendChild(grandParent);

			expect(getElementIndex(child1)).toBe(0);
			expect(getElementIndex(child2)).toBe(1);
		});

		test('works with elements that have been moved', () => {
			const parent1 = document.createElement('div');
			const parent2 = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');
			const movableChild = document.createElement('p');

			parent1.appendChild(child1);
			parent1.appendChild(movableChild);
			parent2.appendChild(child2);
			document.body.appendChild(parent1);
			document.body.appendChild(parent2);

			expect(getElementIndex(movableChild)).toBe(1);

			parent2.appendChild(movableChild);
			expect(getElementIndex(movableChild)).toBe(1);
		});

		test('recursive implementation behavior', () => {
			const parent = document.createElement('div');
			const elements = [];

			for (let i = 0; i < 5; i++) {
				const element = document.createElement('span');
				elements.push(element);
				parent.appendChild(element);
			}
			document.body.appendChild(parent);

			elements.forEach((element, expectedIndex) => {
				expect(getElementIndex(element)).toBe(expectedIndex);
			});
		});
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
		test('getElementIndex works with dynamically created elements', () => {
			const container = document.createElement('div');
			const elements = [];

			for (let i = 0; i < 5; i++) {
				const element = document.createElement('span');
				element.textContent = `Element ${i}`;
				elements.push(element);
				container.appendChild(element);
			}

			document.body.appendChild(container);

			elements.forEach((element, index) => {
				expect(getElementIndex(element)).toBe(index);
			});
		});

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

		test('complex DOM manipulation scenario', () => {
			const container = document.createElement('div');
			const list = document.createElement('ul');

			for (let i = 0; i < 3; i++) {
				const item = document.createElement('li');
				item.textContent = `Item ${i}`;
				list.appendChild(item);
			}

			container.appendChild(list);
			document.body.appendChild(container);

			const items = Array.from(list.children);
			const initialIndices = items.map(item => getElementIndex(item));
			expect(initialIndices).toEqual([0, 1, 2]);

			const firstItem = items[0];
			list.appendChild(firstItem);

			expect(getElementIndex(items[1])).toBe(0);
			expect(getElementIndex(items[2])).toBe(1);
			expect(getElementIndex(firstItem)).toBe(2);
		});

		test('hierarchy validation without XPath dependency', () => {
			document.body.innerHTML = `
				<main>
					<section class="content">
						<h2>Section Title</h2>
						<p>This section contains important information.</p>
						<div class="highlight">
							<p>Highlighted important details here.</p>
						</div>
					</section>
					<footer>
						<p>Footer with important disclaimer.</p>
					</footer>
				</main>
			`;

			const main = document.querySelector('main');
			const section = document.querySelector('.content');
			const allParagraphs = document.querySelectorAll('p');

			allParagraphs.forEach(element => {
				expect(isDescendantOf(element, main)).toBe(true);
			});

			const sectionParagraphs = section.querySelectorAll('p');
			if (sectionParagraphs.length >= 2) {
				const firstIndex = getElementIndex(sectionParagraphs[0]);
				const secondIndex = getElementIndex(sectionParagraphs[1]);

				expect(firstIndex).toBe(1);
				expect(secondIndex).toBe(0);
			}
		});

		test('performance with large DOM structures', () => {
			const container = document.createElement('div');

			for (let i = 0; i < 50; i++) {
				const section = document.createElement('section');
				for (let j = 0; j < 5; j++) {
					const p = document.createElement('p');
					p.textContent = `Section ${i} paragraph ${j}`;
					section.appendChild(p);
				}
				container.appendChild(section);
			}

			document.body.appendChild(container);

			const start = Date.now();

			const firstParagraph = container.querySelector('p');
			const isDescendant = isDescendantOf(firstParagraph, container);
			const elementIndex = getElementIndex(firstParagraph);

			const elapsed = Date.now() - start;

			expect(isDescendant).toBe(true);
			expect(typeof elementIndex).toBe('number');
			expect(elementIndex).toBe(0);

			expect(elapsed).toBeLessThan(100);
		});
	});

	describe('edge cases and error handling', () => {
		test('getElementIndex throws with null/undefined', () => {
			expect(() => getElementIndex(null)).toThrow();
			expect(() => getElementIndex(undefined)).toThrow();
		});

		test('handles detached elements', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');

			parent.appendChild(child1);
			parent.appendChild(child2);

			expect(getElementIndex(child1)).toBe(0);
			expect(getElementIndex(child2)).toBe(1);
			expect(isDescendantOf(child1, parent)).toBe(true);
		});

		test('handles circular references safely', () => {
			const element = document.createElement('div');
			document.body.appendChild(element);

			expect(isDescendantOf(element, element)).toBe(false);
			expect(isDescendantOf(document.body, element)).toBe(false);
		});

		test('function return types are correct', () => {
			const element = document.createElement('div');
			document.body.appendChild(element);

			expect(typeof getElementIndex(element)).toBe('number');
			expect(typeof isDescendantOf(element, document.body)).toBe('boolean');
		});

		test('extreme nesting scenarios', () => {
			let current = document.body;
			const elements = [];

			for (let i = 0; i < 10; i++) {
				const element = document.createElement('div');
				element.id = `level-${i}`;
				current.appendChild(element);
				elements.push(element);
				current = element;
			}

			expect(isDescendantOf(elements[9], elements[0])).toBe(true);
			expect(isDescendantOf(elements[0], elements[9])).toBe(false);

			elements.forEach(element => {
				expect(getElementIndex(element)).toBe(0);
			});
		});
	});
});
