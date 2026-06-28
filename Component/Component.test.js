import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Oxject } from '@vanilla-bean/oxject';
import { Elem } from '../Elem';
import Component from './Component';

const user = userEvent.setup();

describe('Component', () => {
	let component;

	afterEach(() => {
		component?.destroy?.();
		component = null;
		document.body.replaceChildren();
	});

	describe('construction', () => {
		test('creates default component with div element', () => {
			component = new Component();
			expect(component.tag).toBe('div');
			expect(component.elem.tagName).toBe('DIV');
			expect(component.elem._elem).toBe(component);
		});

		test('inherits all Elem functionality', () => {
			component = new Component({
				tag: 'button',
				textContent: 'Click Me',
				className: 'test-btn',
				attributes: { 'data-testid': 'test-button' },
			});
			document.body.appendChild(component.elem);

			const button = screen.getByTestId('test-button');
			expect(button).toHaveTextContent('Click Me');
			expect(button).toHaveClass('test-btn');
			expect(button.tagName).toBe('BUTTON');
		});

		test('handles children in constructor like Elem', () => {
			const child1 = new Component({ tag: 'span', textContent: 'Child 1' });
			const child2 = new Component({ tag: 'span', textContent: 'Child 2' });

			component = new Component(
				{
					tag: 'div',
					attributes: { 'data-testid': 'parent' },
				},
				child1,
				child2,
			);
			document.body.appendChild(component.elem);

			expect(screen.getByText('Child 1')).toBeInTheDocument();
			expect(screen.getByText('Child 2')).toBeInTheDocument();

			const parent = screen.getByTestId('parent');
			const spans = within(parent).getAllByRole('generic');
			expect(spans[0]).toHaveTextContent('Child 1');
			expect(spans[1]).toHaveTextContent('Child 2');
		});

		test('handles styles option as object', () => {
			component = new Component({
				styles: { color: 'red', fontSize: '16px' },
			});
			document.body.appendChild(component.elem);

			expect(component.elem).toHaveStyle({
				color: 'red',
				fontSize: '16px',
			});
		});
	});

	describe('rendering system', () => {
		test('has render method', () => {
			component = new Component();
			expect(typeof component.render).toBe('function');
		});

		test('render processes component options', () => {
			component = new Component({
				tag: 'p',
				textContent: 'Test content',
				styles: { color: 'red', padding: '10px' },
			});
			document.body.appendChild(component.elem);

			expect(screen.getByText('Test content')).toBeInTheDocument();
			expect(component.elem).toHaveStyle({ color: 'red', padding: '10px' });

			expect(() => component.render()).not.toThrow();
			expect(component.elem).toHaveStyle({ color: 'red', padding: '10px' });
		});

		test('render method exists and is callable', () => {
			component = new Component();
			expect(() => component.render()).not.toThrow();
		});
	});

	describe('event system integration', () => {
		test('handles DOM events like Elem', async () => {
			const clickHandler = mock();

			component = new Component({
				tag: 'button',
				textContent: 'Click me',
			});

			component.elem.onclick = clickHandler;
			document.body.appendChild(component.elem);

			await user.click(screen.getByRole('button'));
			expect(clickHandler).toHaveBeenCalledTimes(1);
		});

		test('can add event listeners via addEventListener', async () => {
			const clickHandler = mock();

			component = new Component({
				tag: 'button',
				textContent: 'Click me',
			});
			document.body.appendChild(component.elem);

			component.elem.addEventListener('click', clickHandler);

			await user.click(screen.getByRole('button'));
			expect(clickHandler).toHaveBeenCalledTimes(1);
		});

		test('has on method for event handling', () => {
			component = new Component();
			expect(typeof component.on).toBe('function');
		});
	});

	describe('method chaining and fluent API', () => {
		test('maintains Elem chaining capabilities', () => {
			component = new Component({ tag: 'div' })
				.addClass('component', 'active')
				.setStyle({ padding: '10px', margin: '5px' })
				.setAttributes({ role: 'main', 'aria-label': 'Main content' });

			document.body.appendChild(component.elem);

			expect(component.elem).toHaveClass('component', 'active');
			expect(component.elem).toHaveStyle({ padding: '10px', margin: '5px' });
			expect(component.elem).toHaveAttribute('role', 'main');
			expect(component.elem).toHaveAttribute('aria-label', 'Main content');
		});

		test('can chain methods after render', () => {
			component = new Component({ tag: 'span', textContent: 'Test' });
			component.render();
			component.addClass('rendered');

			expect(component.elem).toHaveClass('rendered');
			expect(component.elem.textContent).toBe('Test');
		});
	});

	describe('inheritance and polymorphism', () => {
		test('can be extended by custom components', () => {
			class CustomComponent extends Component {
				constructor(options = {}) {
					super({ tag: 'article', ...options });
					this.customProperty = 'custom';
				}

				customMethod() {
					return 'custom behavior';
				}
			}

			const custom = new CustomComponent({
				textContent: 'Custom content',
				attributes: { 'data-testid': 'custom' },
			});
			document.body.appendChild(custom.elem);

			expect(custom.elem.tagName).toBe('ARTICLE');
			expect(custom.customProperty).toBe('custom');
			expect(custom.customMethod()).toBe('custom behavior');
			expect(screen.getByTestId('custom')).toHaveTextContent('Custom content');

			custom.destroy?.();
		});

		test('extended components maintain Component functionality', () => {
			class ContextAwareComponent extends Component {
				constructor(options = {}) {
					super(options);
				}
			}

			const custom = new ContextAwareComponent();

			expect(typeof custom.render).toBe('function');
			expect(typeof custom.on).toBe('function');
			expect(custom.elem).toBeDefined();

			custom.destroy?.();
		});
	});

	describe('edge cases and error handling', () => {
		test('handles null context gracefully', () => {
			expect(() => {
				component = new Component({ context: null });
			}).not.toThrow();
		});

		test('handles undefined styles gracefully', () => {
			expect(() => {
				component = new Component({ styles: undefined });
			}).not.toThrow();
		});

		test('handles empty styles object', () => {
			expect(() => {
				component = new Component({ styles: {} });
			}).not.toThrow();
		});

		test('handles invalid options gracefully', () => {
			expect(() => {
				component = new Component({ invalidOption: 'test' });
			}).not.toThrow();
		});
	});

	describe('lifecycle management', () => {
		test('component can be destroyed if destroy method exists', () => {
			component = new Component();

			if (typeof component.destroy === 'function') {
				expect(() => component.destroy()).not.toThrow();
			} else {
				expect(component).toBeDefined();
			}
		});

		test('handles multiple render calls', () => {
			component = new Component({
				tag: 'p',
				textContent: 'Test',
			});
			document.body.appendChild(component.elem);

			expect(() => {
				component.render();
				component.render();
				component.render();
			}).not.toThrow();

			expect(screen.getByText('Test')).toBeInTheDocument();
		});
	});

	describe('integration scenarios', () => {
		test('creates basic component structure', () => {
			component = new Component({
				tag: 'main',
				className: 'app-container',
				attributes: { 'data-testid': 'app' },
				styles: {
					backgroundColor: 'gray',
					color: 'blue',
					padding: '20px',
				},
			});

			const header = new Component({
				tag: 'header',
				className: 'app-header',
			});

			const title = new Component({
				tag: 'h1',
				textContent: 'App Title',
				attributes: { 'data-testid': 'title' },
			});

			header.append(title);
			component.append(header);
			document.body.appendChild(component.elem);

			const app = screen.getByTestId('app');
			expect(app).toHaveClass('app-container');
			expect(app).toHaveStyle({
				backgroundColor: 'gray',
				color: 'blue',
				padding: '20px',
			});

			expect(screen.getByTestId('title')).toHaveTextContent('App Title');

			header.destroy?.();
		});

		test('demonstrates component composition', () => {
			class Button extends Component {
				constructor({ variant = 'primary', ...options } = {}) {
					super({
						tag: 'button',
						className: `btn btn-${variant}`,
						...options,
					});
				}
			}

			class Card extends Component {
				constructor(options = {}) {
					super({
						tag: 'div',
						className: 'card',
						...options,
					});
				}
			}

			const card = new Card({
				attributes: { 'data-testid': 'card' },
			});

			const primaryBtn = new Button({
				variant: 'primary',
				textContent: 'Primary Action',
				attributes: { 'data-testid': 'primary-btn' },
			});

			const secondaryBtn = new Button({
				variant: 'secondary',
				textContent: 'Secondary Action',
				attributes: { 'data-testid': 'secondary-btn' },
			});

			card.append(primaryBtn, secondaryBtn);
			document.body.appendChild(card.elem);

			const cardElement = screen.getByTestId('card');
			expect(cardElement).toHaveClass('card');

			const primaryButton = screen.getByTestId('primary-btn');
			expect(primaryButton).toHaveClass('btn', 'btn-primary');
			expect(primaryButton).toHaveTextContent('Primary Action');

			const secondaryButton = screen.getByTestId('secondary-btn');
			expect(secondaryButton).toHaveClass('btn', 'btn-secondary');
			expect(secondaryButton).toHaveTextContent('Secondary Action');

			card.destroy?.();
			primaryBtn.destroy?.();
			secondaryBtn.destroy?.();
		});
	});

	describe('Component-specific functionality', () => {
		test('processes options during construction', () => {
			const spy = spyOn(Component.prototype, 'render');

			component = new Component({
				tag: 'section',
				className: 'test-section',
				textContent: 'Test Content',
			});

			expect(spy).toHaveBeenCalled();
			expect(component.elem.tagName).toBe('SECTION');
			expect(component.elem).toHaveClass('test-section');
			expect(component.elem.textContent).toBe('Test Content');
		});

		test('handles complex option processing', () => {
			const options = {
				tag: 'article',
				className: 'article-class',
				attributes: { 'data-id': '123', role: 'article' },
				style: { margin: '10px', padding: '20px' },
				textContent: 'Article content',
			};

			component = new Component(options);
			document.body.appendChild(component.elem);

			expect(component.elem.tagName).toBe('ARTICLE');
			expect(component.elem).toHaveClass('article-class');
			expect(component.elem).toHaveAttribute('data-id', '123');
			expect(component.elem).toHaveAttribute('role', 'article');
			expect(component.elem).toHaveStyle({ margin: '10px', padding: '20px' });
			expect(component.elem.textContent).toBe('Article content');
		});
	});

	describe('reactive options', () => {
		test('option assigned after render triggers _setOption', () => {
			let reactions = 0;

			class TestComp extends Component {
				_setOption(key, value) {
					if (key === 'textContent' && this.rendered) reactions++;
					super._setOption(key, value);
				}
			}

			const comp = new TestComp({ autoRender: false });
			comp.render();

			comp.options.textContent = 'hello';
			expect(reactions).toBe(1);

			comp.options.textContent = 'world';
			expect(reactions).toBe(2);

			comp.destroy();
		});

		test('option assigned before render is picked up by _processOptions', () => {
			const comp = new Component({ autoRender: false });
			comp.options.textContent = 'pre-render';
			comp.render();

			expect(comp.elem.textContent).toBe('pre-render');
			comp.destroy();
		});

		test('subscriber as option value wires reactively', () => {
			const ctx = new Oxject({ count: 0 });
			const comp = new Component({
				textContent: ctx.subscriber('count', n => `Count: ${n}`),
				appendTo: document.body,
			});

			expect(comp.elem.textContent).toContain('0');

			ctx.count = 5;
			expect(comp.elem.textContent).toContain('5');

			ctx.count = 10;
			expect(comp.elem.textContent).toContain('10');

			comp.destroy();
			ctx.destroy();
		});

		test('subscriber cleanup runs on component destroy', () => {
			const ctx = new Oxject({ name: 'Alice' });
			const parser = mock(v => v.toUpperCase());

			const comp = new Component({
				textContent: ctx.subscriber('name', parser),
				appendTo: document.body,
			});

			const callsAfterMount = parser.mock.calls.length;

			ctx.name = 'Bob';
			expect(parser.mock.calls.length).toBeGreaterThan(callsAfterMount);

			comp.destroy();
			const callsAfterDestroy = parser.mock.calls.length;

			ctx.name = 'Charlie';
			expect(parser.mock.calls.length).toBe(callsAfterDestroy);

			ctx.destroy();
		});
	});

	describe('lifecycle ordering', () => {
		test('build() runs before _processOptions', () => {
			let buildRanBeforeOption = false;
			let buildRan = false;

			class TestComp extends Component {
				build() {
					buildRan = true;
					new Elem({ tag: 'span', appendTo: this });
				}

				_setOption(key, value) {
					if (key === 'textContent') buildRanBeforeOption = buildRan;
					super._setOption(key, value);
				}
			}

			const comp = new TestComp({ textContent: 'hello', autoRender: false });
			comp.render();
			expect(buildRanBeforeOption).toBe(true);
			comp.destroy();
		});

		test('re-render clears previous children via empty()', () => {
			class TestComp extends Component {
				build() {
					new Elem({ tag: 'span', appendTo: this });
				}
			}

			const comp = new TestComp({ autoRender: false });
			comp.render();
			// eslint-disable-next-line testing-library/no-node-access
			expect(comp.elem.childElementCount).toBe(1);

			comp.render();
			// eslint-disable-next-line testing-library/no-node-access
			expect(comp.elem.childElementCount).toBe(1);

			comp.destroy();
		});

		test('priority options run before non-priority options', () => {
			const order = [];

			class TestComp extends Component {
				_setOption(key, value) {
					if (key === 'textContent' || key === 'style') order.push(key);
					super._setOption(key, value);
				}
			}

			const comp = new TestComp({ style: { color: 'red' }, textContent: 'hello', autoRender: false });
			comp.render();

			expect(order[0]).toBe('textContent');
			comp.destroy();
		});
	});

	describe('static handlers', () => {
		test('handler is called for matching option key on render', () => {
			const called = [];

			class TestComp extends Component {
				static handlers = {
					label(value) {
						called.push(value);
					},
				};
			}

			const comp = new TestComp({ label: 'hello' });
			expect(called).toContain('hello');
			comp.destroy();
		});

		test('handler is called for matching option key on reactive update', () => {
			const called = [];

			class TestComp extends Component {
				static handlers = {
					label(value) {
						called.push(value);
					},
				};
			}

			const comp = new TestComp({ label: 'first' });
			comp.options.label = 'second';
			expect(called).toContain('second');
			comp.destroy();
		});

		test('subclass handler shadows parent handler', () => {
			const parentCalls = [];
			const childCalls = [];

			class Parent extends Component {
				static handlers = {
					label(value) {
						parentCalls.push(value);
					},
				};
			}

			class Child extends Parent {
				static handlers = {
					label(value) {
						childCalls.push(value);
					},
				};
			}

			const comp = new Child({ label: 'test' });
			expect(childCalls).toContain('test');
			expect(parentCalls).not.toContain('test');
			comp.destroy();
		});

		test('handler can call parent handler explicitly', () => {
			const parentCalls = [];
			const childCalls = [];

			class Parent extends Component {
				static handlers = {
					label(value) {
						parentCalls.push(value);
					},
				};
			}

			class Child extends Parent {
				static handlers = {
					label(value) {
						childCalls.push(value);
						Parent.handlers.label.call(this, value);
					},
				};
			}

			const comp = new Child({ label: 'test' });
			expect(childCalls).toContain('test');
			expect(parentCalls).toContain('test');
			comp.destroy();
		});
	});

	describe('cleanup system', () => {
		test('addCleanup chains — both functions run on processCleanup', () => {
			const comp = new Component({ autoRender: false });
			const calls = [];

			comp.addCleanup('test', () => calls.push('first'));
			comp.addCleanup('test', () => calls.push('second'));

			comp.processCleanup();
			expect(calls).toContain('first');
			expect(calls).toContain('second');
		});

		test('replaceCleanup runs previous immediately and stores the new one', () => {
			const comp = new Component({ autoRender: false });
			let count = 0;

			comp.replaceCleanup('test', () => count++);
			comp.replaceCleanup('test', () => count++); // runs previous → count: 1
			comp.replaceCleanup('test', () => count++); // runs previous → count: 2

			const beforeFinal = count;
			comp.processCleanup(); // runs only latest → count: 3
			expect(count - beforeFinal).toBe(1);
		});

		test('processCleanup runs child cleanup recursively when rootCleanup=true', () => {
			const calls = [];
			const parent = new Component({ appendTo: document.body });
			const child = new Component({ appendTo: parent });

			child.addCleanup('test', () => calls.push('child'));

			parent.processCleanup(parent.cleanup, true);
			expect(calls).toContain('child');

			parent.elem.remove();
		});
	});

	describe('_setOption routing', () => {
		test('aria-* routes to setAttribute', () => {
			component = new Component({ 'aria-label': 'test label' });
			document.body.appendChild(component.elem);
			expect(component.elem).toHaveAttribute('aria-label', 'test label');
		});

		test('aria-* set to null removes the attribute', () => {
			component = new Component({ 'aria-label': 'initial', appendTo: document.body });
			component.options['aria-label'] = null;
			expect(component.elem).not.toHaveAttribute('aria-label');
		});

		test('data-* routes to setAttribute', () => {
			component = new Component({ 'data-testid': 'my-comp', appendTo: document.body });
			expect(component.elem).toHaveAttribute('data-testid', 'my-comp');
		});

		test('style object routes to setStyle', () => {
			component = new Component({ style: { color: 'red', fontSize: '14px' }, appendTo: document.body });
			expect(component.elem).toHaveStyle({ color: 'red', fontSize: '14px' });
		});

		test('styles function routes through theme system to inline style', () => {
			component = new Component({ styles: () => ({ color: 'red' }), appendTo: document.body });
			expect(component.elem).toHaveStyle({ color: 'red' });
		});

		test('on* option registers a recognized pointer event', () => {
			const handler = mock();
			component = new Component({ tag: 'button', onPointerDown: handler, appendTo: document.body });
			component.elem.dispatchEvent(new PointerEvent('pointerdown'));
			expect(handler).toHaveBeenCalled();
		});

		test('on* method route — onPointerPress calls the component method', () => {
			const handler = mock();
			component = new Component({ tag: 'button', onPointerPress: handler, appendTo: document.body });

			component.elem.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			expect(handler).toHaveBeenCalled();
		});

		test('addClass option calls the addClass method', () => {
			component = new Component({ addClass: ['foo', 'bar'], appendTo: document.body });
			expect(component.elem).toHaveClass('foo', 'bar');
		});

		test('reactive aria-* update goes through setAttribute', () => {
			component = new Component({ 'aria-expanded': false, appendTo: document.body });
			component.options['aria-expanded'] = true;
			expect(component.elem).toHaveAttribute('aria-expanded');
		});
	});
});
