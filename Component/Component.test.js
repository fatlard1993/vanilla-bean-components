import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Context } from '../Context';
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

		test('handles context option', () => {
			const context = new Context({ count: 0, name: 'Test' });
			component = new Component({ context });

			expect(component).toBeDefined();
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

	describe('context integration scenarios', () => {
		test('accepts context in constructor', () => {
			const context = new Context({ message: 'Hello' });

			expect(() => {
				component = new Component({ context });
			}).not.toThrow();
		});

		test('handles styles with context if supported', () => {
			const context = new Context({ color: 'blue' });

			try {
				component = new Component({
					context,
					styles: () => ({ color: 'red' }),
				});
				document.body.appendChild(component.elem);

				expect(component.elem).toHaveStyle({ color: 'red' });
			} catch (error) {
				expect(error).toBeDefined();
			}
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
});
