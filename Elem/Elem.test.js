import { screen, queryByText, findByRole, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import Elem from './Elem';

const user = userEvent.setup();

describe('Elem', () => {
	let elem;

	afterEach(() => {
		elem = null;
		document.body.replaceChildren();
	});

	describe('construction', () => {
		test('creates default div element', () => {
			elem = new Elem();
			expect(elem.tag).toBe('div');
			expect(elem.elem.tagName).toBe('DIV');
			expect(elem.elem._elem).toBe(elem);
		});

		test('creates element with specified tag', () => {
			elem = new Elem({ tag: 'button' });
			expect(elem.tag).toBe('button');
			expect(elem.elem.tagName).toBe('BUTTON');
		});

		test('applies basic properties during construction', () => {
			elem = new Elem({
				tag: 'input',
				id: 'test-input',
				className: 'form-control',
				disabled: true,
			});
			document.body.appendChild(elem.elem);

			const input = screen.getByRole('textbox');
			expect(input).toHaveAttribute('id', 'test-input');
			expect(input).toHaveClass('form-control');
			expect(input).toBeDisabled();
		});

		test('applies text content during construction', () => {
			elem = new Elem({
				tag: 'button',
				textContent: 'Click Me',
			});
			document.body.appendChild(elem.elem);

			expect(screen.getByRole('button')).toHaveTextContent('Click Me');
		});

		test('handles children in constructor', () => {
			const child1 = new Elem({ tag: 'span', textContent: 'Child 1' });
			const child2 = new Elem({ tag: 'span', textContent: 'Child 2' });

			elem = new Elem(
				{
					tag: 'div',
					attributes: { 'data-testid': 'parent' },
				},
				child1,
				child2,
			);
			document.body.appendChild(elem.elem);

			expect(screen.getByText('Child 1')).toBeInTheDocument();
			expect(screen.getByText('Child 2')).toBeInTheDocument();

			const parent = screen.getByTestId('parent');
			const spans = within(parent).getAllByRole('generic');
			expect(spans[0]).toHaveTextContent('Child 1');
			expect(spans[1]).toHaveTextContent('Child 2');
		});

		test('combines append option with constructor children', () => {
			const child1 = new Elem({ tag: 'span', textContent: 'Option child' });
			const child2 = new Elem({ tag: 'span', textContent: 'Constructor child' });

			elem = new Elem(
				{
					tag: 'div',
					attributes: { 'data-testid': 'parent' },
					append: [child1],
				},
				child2,
			);
			document.body.appendChild(elem.elem);

			expect(screen.getByText('Option child')).toBeInTheDocument();
			expect(screen.getByText('Constructor child')).toBeInTheDocument();

			const parent = screen.getByTestId('parent');
			const spans = within(parent).getAllByRole('generic');
			expect(spans[0]).toHaveTextContent('Option child');
			expect(spans[1]).toHaveTextContent('Constructor child');
		});
	});

	describe('string representation', () => {
		test('returns correct string representation', () => {
			elem = new Elem();
			expect(elem.toString()).toBe('[object Elem]');
		});
	});

	describe('hierarchy properties', () => {
		test('provides access to parent elements', () => {
			const parent = new Elem({ tag: 'div' });
			elem = new Elem({ tag: 'span' });

			parent.append(elem);

			expect(elem.parentElem).toBe(parent.elem);
			expect(elem.parent).toBe(parent);
		});

		test('returns null for orphaned elements', () => {
			elem = new Elem();
			expect(elem.parentElem).toBe(null);
			expect(elem.parent).toBe(undefined);
		});

		test('provides access to child Elem instances', () => {
			elem = new Elem({ tag: 'div' });
			const child1 = new Elem({ tag: 'span' });
			const child2 = new Elem({ tag: 'p' });

			elem.append(child1, child2);

			// eslint-disable-next-line testing-library/no-node-access
			expect(elem.children).toEqual([child1, child2]);
			// eslint-disable-next-line testing-library/no-node-access
			expect(elem.children.length).toBe(2);
		});

		test('returns empty array when no Elem children', () => {
			elem = new Elem();

			// eslint-disable-next-line testing-library/no-node-access
			expect(elem.children).toEqual([]);
		});
	});

	describe('class manipulation', () => {
		beforeEach(() => {
			elem = new Elem({ className: 'initial btn btn-primary active' });
			document.body.appendChild(elem.elem);
		});

		test('checks for classes correctly', () => {
			expect(elem.hasClass('btn')).toBe(true);
			expect(elem.hasClass('btn', 'active')).toBe(true);
			expect(elem.hasClass('nonexistent')).toBe(false);
			expect(elem.hasClass('btn', 'nonexistent')).toBe(false);
		});

		test('supports regex patterns in hasClass', () => {
			expect(elem.hasClass(/btn-primary/)).toBe(true);
			expect(elem.hasClass(/\bbtn\b/)).toBe(true);
			expect(elem.hasClass(/active/)).toBe(true);
			expect(elem.hasClass(/^initial/)).toBe(true);
			expect(elem.hasClass(/nonexistent/)).toBe(false);

			expect(elem.hasClass(/btn/, 'active')).toBe(true);
			expect(elem.hasClass(/btn/, 'nonexistent')).toBe(false);
		});

		test('adds classes correctly', () => {
			elem.addClass('new-class', 'another-class');

			expect(elem.elem).toHaveClass('new-class', 'another-class');
		});

		test('adds classes from arrays', () => {
			elem.addClass(['array-class1', 'array-class2'], 'single-class');

			expect(elem.elem).toHaveClass('array-class1', 'array-class2', 'single-class');
		});

		test('returns this for chaining addClass', () => {
			const result = elem.addClass('chainable');
			expect(result).toBe(elem);
		});

		test('removes specific classes', () => {
			elem.removeClass('active');

			expect(elem.elem).not.toHaveClass('active');
			expect(elem.elem).toHaveClass('btn');
		});

		test('removes classes with regex patterns', () => {
			elem.removeClass(/btn-primary/g);

			expect(elem.elem).not.toHaveClass('btn-primary');
			expect(elem.elem).toHaveClass('btn', 'active');
		});

		test('returns this for chaining removeClass', () => {
			const result = elem.removeClass('active');
			expect(result).toBe(elem);
		});
	});

	describe('content manipulation', () => {
		beforeEach(() => {
			elem = new Elem({ tag: 'div' });
			document.body.appendChild(elem.elem);
		});

		test('empties element content', () => {
			elem.elem.innerHTML = '<span>child</span><p>another</p>';
			elem.empty();

			expect(queryByText(document.body, 'child')).not.toBeInTheDocument();
			expect(queryByText(document.body, 'another')).not.toBeInTheDocument();
		});

		test('sets text content', () => {
			elem.content('Hello world');
			expect(screen.getByText('Hello world')).toBeInTheDocument();
		});

		test('sets element content', () => {
			const child = new Elem({ tag: 'span', textContent: 'Child content' });
			elem.content(child);

			expect(screen.getByText('Child content')).toBeInTheDocument();
		});

		test('replaces existing content when setting new content', () => {
			elem.elem.innerHTML = '<p>Original</p>';
			elem.content('New content');

			expect(screen.getByText('New content')).toBeInTheDocument();
			expect(queryByText(document.body, 'Original')).not.toBeInTheDocument();
		});

		test('returns this for chaining content', () => {
			const result = elem.content('test');
			expect(result).toBe(elem);
		});
	});

	describe('styling', () => {
		beforeEach(() => {
			elem = new Elem();
			document.body.appendChild(elem.elem);
		});

		test('applies CSS styles', () => {
			elem.setStyle({
				color: 'red',
				fontSize: '16px',
				backgroundColor: 'blue',
			});

			expect(elem.elem).toHaveStyle({
				color: 'red',
				fontSize: '16px',
				backgroundColor: 'blue',
			});
		});

		test('ignores invalid style inputs', () => {
			elem.setStyle(null);
			elem.setStyle('not-an-object');
			elem.setStyle(['not', 'an', 'object']);

			const result = elem.setStyle({ color: 'red' });
			expect(result).toBe(elem);
			expect(elem.elem).toHaveStyle({ color: 'red' });
		});

		test('ignores invalid style keys', () => {
			elem.setStyle({
				'123invalid': 'value',
				'': 'empty-key',
				color: 'red',
			});

			expect(elem.elem).toHaveStyle({ color: 'red' });
		});

		test('returns this for chaining setStyle', () => {
			const result = elem.setStyle({ color: 'red' });
			expect(result).toBe(elem);
		});
	});

	describe('attributes', () => {
		beforeEach(() => {
			elem = new Elem();
			document.body.appendChild(elem.elem);
		});

		test('sets HTML attributes', () => {
			elem.setAttributes({
				'data-id': '123',
				role: 'button',
				'aria-label': 'Close button',
			});

			expect(elem.elem).toHaveAttribute('data-id', '123');
			expect(elem.elem).toHaveAttribute('role', 'button');
			expect(elem.elem).toHaveAttribute('aria-label', 'Close button');
		});

		test('returns this for chaining setAttributes', () => {
			const result = elem.setAttributes({ 'data-test': 'value' });
			expect(result).toBe(elem);
		});
	});

	describe('child element management', () => {
		beforeEach(() => {
			elem = new Elem({
				tag: 'div',
				attributes: { 'data-testid': 'parent' },
			});
			document.body.appendChild(elem.elem);
		});

		test('appends child elements in correct order', () => {
			const child1 = new Elem({ tag: 'span', textContent: 'Child 1' });
			const child2 = new Elem({ tag: 'p', textContent: 'Child 2' });

			elem.append(child1, child2);

			expect(screen.getByText('Child 1')).toBeInTheDocument();
			expect(screen.getByText('Child 2')).toBeInTheDocument();

			const child1Element = screen.getByText('Child 1');
			const child2Element = screen.getByText('Child 2');
			expect(child1Element.compareDocumentPosition(child2Element)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
		});

		test('appends nested arrays of children', () => {
			const child1 = new Elem({ tag: 'span', textContent: 'Child 1' });
			const child2 = new Elem({ tag: 'span', textContent: 'Child 2' });
			const child3 = new Elem({ tag: 'span', textContent: 'Child 3' });

			elem.append([child1, [child2]], child3);

			expect(screen.getByText('Child 1')).toBeInTheDocument();
			expect(screen.getByText('Child 2')).toBeInTheDocument();
			expect(screen.getByText('Child 3')).toBeInTheDocument();

			const child1Element = screen.getByText('Child 1');
			const child2Element = screen.getByText('Child 2');
			const child3Element = screen.getByText('Child 3');

			expect(child1Element.compareDocumentPosition(child2Element)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
			expect(child2Element.compareDocumentPosition(child3Element)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
		});

		test('appends raw HTMLElements', () => {
			const rawDiv = document.createElement('div');
			rawDiv.textContent = 'Raw element';

			elem.append(rawDiv);

			expect(screen.getByText('Raw element')).toBeInTheDocument();
		});

		test('ignores null/undefined children in append', () => {
			const validChild = new Elem({ textContent: 'Valid' });
			elem.append(null, undefined, validChild);

			expect(screen.getByText('Valid')).toBeInTheDocument();

			expect(screen.queryByText('null')).not.toBeInTheDocument();
			expect(screen.queryByText('undefined')).not.toBeInTheDocument();
		});

		test('prepends child elements in correct order', () => {
			elem.elem.innerHTML = '<p>Existing</p>';

			const child1 = new Elem({ tag: 'span', textContent: 'Prepended 1' });
			const child2 = new Elem({ tag: 'div', textContent: 'Prepended 2' });

			elem.prepend(child1, child2);

			expect(screen.getByText('Prepended 1')).toBeInTheDocument();
			expect(screen.getByText('Prepended 2')).toBeInTheDocument();
			expect(screen.getByText('Existing')).toBeInTheDocument();

			const prepended1 = screen.getByText('Prepended 1');
			const prepended2 = screen.getByText('Prepended 2');
			const existing = screen.getByText('Existing');

			expect(prepended2.compareDocumentPosition(prepended1)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

			expect(prepended1.compareDocumentPosition(existing)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
		});

		test('prepends to empty element', () => {
			const child = new Elem({ tag: 'span', textContent: 'First child' });

			elem.prepend(child);

			expect(screen.getByText('First child')).toBeInTheDocument();
		});

		test('prepend maintains correct order with multiple calls', () => {
			const child1 = new Elem({ tag: 'span', textContent: 'First' });
			const child2 = new Elem({ tag: 'span', textContent: 'Second' });
			const child3 = new Elem({ tag: 'span', textContent: 'Third' });

			elem.prepend(child1);
			elem.prepend(child2);
			elem.prepend(child3);

			const firstElement = screen.getByText('First');
			const secondElement = screen.getByText('Second');
			const thirdElement = screen.getByText('Third');

			expect(thirdElement.compareDocumentPosition(secondElement)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
			expect(secondElement.compareDocumentPosition(firstElement)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
		});

		test('returns this for chaining append/prepend', () => {
			const child = new Elem();

			expect(elem.append(child)).toBe(elem);
			expect(elem.prepend(child)).toBe(elem);
		});
	});

	describe('parent manipulation', () => {
		test('appends to parent element', () => {
			const parent = new Elem({
				tag: 'div',
				attributes: { 'data-testid': 'parent' },
			});
			elem = new Elem({ tag: 'span', textContent: 'Child element' });
			document.body.appendChild(parent.elem);

			elem.appendTo(parent);

			expect(screen.getByText('Child element')).toBeInTheDocument();

			const parentElement = screen.getByTestId('parent');
			expect(within(parentElement).getByText('Child element')).toBeInTheDocument();
		});

		test('appends to raw HTMLElement parent', () => {
			const parent = document.createElement('div');
			parent.setAttribute('data-testid', 'parent');
			elem = new Elem({ tag: 'span', textContent: 'Child element' });
			document.body.appendChild(parent);

			elem.appendTo(parent);

			expect(screen.getByText('Child element')).toBeInTheDocument();

			const parentElement = screen.getByTestId('parent');
			expect(within(parentElement).getByText('Child element')).toBeInTheDocument();
		});

		test('prepends to parent element maintaining order', () => {
			const parent = new Elem({
				tag: 'div',
				attributes: { 'data-testid': 'parent' },
			});
			parent.elem.innerHTML = '<p>Existing</p>';
			document.body.appendChild(parent.elem);

			elem = new Elem({ tag: 'span', textContent: 'Prepended' });
			elem.prependTo(parent.elem);

			expect(screen.getByText('Prepended')).toBeInTheDocument();
			expect(screen.getByText('Existing')).toBeInTheDocument();

			const prependedElement = screen.getByText('Prepended');
			const existingElement = screen.getByText('Existing');
			expect(prependedElement.compareDocumentPosition(existingElement)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
		});

		test('prepends to empty parent', () => {
			const parent = document.createElement('div');
			parent.setAttribute('data-testid', 'parent');
			document.body.appendChild(parent);

			elem = new Elem({ tag: 'span', textContent: 'First child' });
			elem.prependTo(parent);

			expect(screen.getByText('First child')).toBeInTheDocument();

			const parentElement = screen.getByTestId('parent');
			expect(within(parentElement).getByText('First child')).toBeInTheDocument();
		});

		test('handles invalid parent in appendTo', () => {
			elem = new Elem();
			expect(() => elem.appendTo(null)).not.toThrow();
			expect(() => elem.appendTo({})).not.toThrow();
		});
	});

	describe('option routing', () => {
		test('calls Elem methods for matching option keys', () => {
			const setStyleSpy = spyOn(Elem.prototype, 'setStyle');
			const setAttributesSpy = spyOn(Elem.prototype, 'setAttributes');

			elem = new Elem({
				style: { color: 'red' },
				attributes: { 'data-test': 'value' },
			});

			expect(setStyleSpy).toHaveBeenCalledWith({ color: 'red' });
			expect(setAttributesSpy).toHaveBeenCalledWith({ 'data-test': 'value' });
		});

		test('sets HTMLElement properties directly', () => {
			elem = new Elem({
				id: 'test-id',
				className: 'test-class',
				textContent: 'test-content',
			});
			document.body.appendChild(elem.elem);

			const element = screen.getByText('test-content');
			expect(element).toHaveAttribute('id', 'test-id');
			expect(element).toHaveClass('test-class');
		});

		test('unwraps Elem instances when setting properties', () => {
			const parent = new Elem({ tag: 'div' });
			elem = new Elem({ tag: 'span' });

			parent.elem.appendChild = mock(child => {
				expect(child).toBe(elem.elem);
			});

			parent._setOption('appendChild', elem);
		});
	});

	describe('setOptions', () => {
		test('updates multiple options at once', () => {
			elem = new Elem();

			elem.setOptions({
				textContent: 'Updated text',
				className: 'updated-class',
				id: 'updated-id',
			});

			expect(elem.options.textContent).toBe('Updated text');
			expect(elem.options.className).toBe('updated-class');
			expect(elem.options.id).toBe('updated-id');
		});

		test('returns this for chaining', () => {
			elem = new Elem();
			const result = elem.setOptions({ textContent: 'test' });
			expect(result).toBe(elem);
		});
	});

	describe('integration scenarios', () => {
		test('creates complex nested structure', () => {
			elem = new Elem(
				{
					tag: 'article',
					className: 'card',
					style: { padding: '20px' },
					attributes: { 'data-article': 'featured' },
				},
				new Elem({ tag: 'h2', textContent: 'Article Title' }),
				new Elem(
					{ tag: 'div', className: 'content' },
					new Elem({ tag: 'p', textContent: 'Article content goes here.' }),
					new Elem({ tag: 'a', textContent: 'Read more', href: '#' }),
				),
			);
			document.body.appendChild(elem.elem);

			const article = screen.getByRole('article');
			expect(article).toHaveClass('card');
			expect(article).toHaveStyle({ padding: '20px' });
			expect(article).toHaveAttribute('data-article', 'featured');
			expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Article Title');
			expect(screen.getByText('Article content goes here.')).toBeInTheDocument();
			expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
		});

		test('demonstrates method chaining', () => {
			elem = new Elem({ tag: 'button', textContent: 'Click me' })
				.addClass('btn', 'btn-primary')
				.setStyle({ fontSize: '14px', padding: '10px' })
				.setAttributes({ type: 'button', role: 'button' });
			document.body.appendChild(elem.elem);

			const button = screen.getByRole('button', { name: 'Click me' });
			expect(button).toHaveClass('btn', 'btn-primary');
			expect(button).toHaveStyle({ fontSize: '14px', padding: '10px' });
			expect(button).toHaveAttribute('type', 'button');
		});

		test('handles event handlers correctly', async () => {
			const clickHandler = mock();

			elem = new Elem({
				tag: 'button',
				textContent: 'Click me',
				onclick: clickHandler,
			});
			document.body.appendChild(elem.elem);

			await user.click(await findByRole(document.body, 'button', { name: 'Click me' }));

			expect(clickHandler).toHaveBeenCalled();
		});

		test('works with document.body operations', () => {
			elem = new Elem({ tag: 'div', textContent: 'Test content' });
			elem.appendTo(document.body);

			expect(screen.getByText('Test content')).toBeInTheDocument();
		});
	});
});
