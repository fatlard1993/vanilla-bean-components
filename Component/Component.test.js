import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Oxject } from '@vanilla-bean/oxject';
import { Elem } from '../Elem';
import Component, { warnOfRetiredOptions } from './Component';
import { classEnum } from './classEnum';

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

	describe('options a setter changes during the first render', () => {
		test('a setter that moves its own option lands on the first render as on a later one', () => {
			const shown = [];

			class Pages extends Component {
				static schema = {
					view: {
						set(value) {
							if (value === 'shop') this.options.view = 'shop_buy';
							else shown.push(value);
						},
					},
				};
			}

			const first = new Pages({ view: 'shop' });
			const later = new Pages({ view: 'sell' });

			later.options.view = 'shop';

			expect(shown).toEqual(['shop_buy', 'sell', 'shop_buy']);
			expect(first.options.view).toBe('shop_buy');
			first.destroy();
			later.destroy();
		});

		test('a setter that changes another option has that option applied', () => {
			class Linked extends Component {
				static schema = {
					mode: {
						set(value) {
							if (value === 'dark') this.options.label = 'Dark';
						},
					},
					label: {
						set(value) {
							this.elem.textContent = value;
						},
					},
				};
			}

			const comp = new Linked({ label: 'Light', mode: 'dark' });

			expect(comp.elem.textContent).toBe('Dark');
			comp.destroy();
		});

		test('a setter that never settles stops instead of looping forever', () => {
			let calls = 0;

			class Restless extends Component {
				static schema = {
					count: {
						set(value) {
							calls++;
							this.options.count = value + 1;
						},
					},
				};
			}

			const comp = new Restless({ count: 0 });

			expect(calls).toBeLessThan(12);
			comp.destroy();
		});
	});

	describe('static schema', () => {
		test('schema defaults are merged automatically', () => {
			class TestComp extends Component {
				static schema = {
					label: { default: 'default label' },
				};
			}

			const comp = new TestComp();
			expect(comp.options.label).toBe('default label');
			comp.destroy();
		});

		test('instance options override schema defaults', () => {
			class TestComp extends Component {
				static schema = {
					label: { default: 'default label' },
				};
			}

			const comp = new TestComp({ label: 'custom' });
			expect(comp.options.label).toBe('custom');
			comp.destroy();
		});

		test('child class schema defaults override parent defaults per-key', () => {
			class Parent extends Component {
				static schema = {
					label: { default: 'parent' },
					size: { default: 'small' },
				};
			}

			class Child extends Parent {
				static schema = {
					label: { default: 'child' },
				};
			}

			const comp = new Child();
			expect(comp.options.label).toBe('child');
			expect(comp.options.size).toBe('small');
			comp.destroy();
		});

		test('getter defaults evaluate fresh per instance', () => {
			let evaluations = 0;

			class TestComp extends Component {
				static schema = {
					stamp: {
						get default() {
							return ++evaluations;
						},
					},
				};
			}

			const first = new TestComp();
			const second = new TestComp();
			expect(first.options.stamp).toBe(1);
			expect(second.options.stamp).toBe(2);
			first.destroy();
			second.destroy();
		});

		test('set runs on render and reactive update', () => {
			const called = [];

			class TestComp extends Component {
				static schema = {
					label: {
						default: 'first',
						set(value) {
							called.push(value);
						},
					},
				};
			}

			const comp = new TestComp();
			comp.options.label = 'second';
			expect(called).toEqual(['first', 'second']);
			comp.destroy();
		});

		test('declared keys with no DOM match are stored silently', () => {
			class TestComp extends Component {
				static schema = {
					gameState: {},
				};
			}

			const comp = new TestComp({ gameState: { score: 0 } });
			comp.options.gameState = { score: 5 };
			expect(comp.options.gameState).toEqual({ score: 5 });
			expect(comp.elem.gameState).toBeUndefined();
			comp.destroy();
		});

		test('declared callback options are stored without event registration or warning', () => {
			const warnings = [];
			const originalWarn = console.warn;
			console.warn = (...args) => warnings.push(args.join(' '));

			class TestComp extends Component {
				static schema = {
					onCustomAction: {},
				};
			}

			const callback = () => {};
			const comp = new TestComp({ onCustomAction: callback });
			console.warn = originalWarn;

			expect(comp.options.onCustomAction).toBe(callback);
			expect(comp.onCustomAction).toBeUndefined();
			expect(warnings.filter(warning => warning.includes('onCustomAction'))).toEqual([]);
			comp.destroy();
		});

		test('data: true forces store-only routing for DOM-colliding names', () => {
			class TestComp extends Component {
				static schema = {
					title: { data: true },
				};
			}

			const comp = new TestComp({ title: 'component data' });
			expect(comp.options.title).toBe('component data');
			expect(comp.elem.title).toBe('');
			comp.destroy();
		});

		test('subclass set shadows parent set when next is not called', () => {
			const order = [];

			class Parent extends Component {
				static schema = {
					label: {
						set(value) {
							order.push(`parent:${value}`);
						},
					},
				};
			}

			class Child extends Parent {
				static schema = {
					label: {
						set(value) {
							order.push(`child:${value}`);
						},
					},
				};
			}

			const comp = new Child({ label: 'test' });
			expect(order).toEqual(['child:test']);
			comp.destroy();
		});

		test('subclass set chains into parent set via next', () => {
			const order = [];

			class Parent extends Component {
				static schema = {
					label: {
						set(value) {
							order.push(`parent:${value}`);
						},
					},
				};
			}

			class Child extends Parent {
				static schema = {
					label: {
						set(value, next) {
							order.push(`child:${value}`);
							next(value);
						},
					},
				};
			}

			const comp = new Child({ label: 'test' });
			expect(order).toEqual(['child:test', 'parent:test']);
			comp.destroy();
		});

		test('defaultOptions getter reflects merged schema defaults', () => {
			class TestComp extends Component {
				static schema = {
					label: { default: 'from schema' },
				};
			}

			const comp = new TestComp();
			expect(comp.defaultOptions.label).toBe('from schema');
			expect(comp.defaultOptions.tag).toBe('div');
			comp.destroy();
		});

		test('attribute: true routes the key through setAttribute', () => {
			class TestComp extends Component {
				static schema = {
					colspan: { attribute: true },
				};
			}

			const comp = new TestComp({ colspan: '2' });
			expect(comp.elem.getAttribute('colspan')).toBe('2');
			comp.destroy();
		});

		test('priority: true keys process before other keys', () => {
			const order = [];

			class TestComp extends Component {
				static schema = {
					first: {
						priority: true,
						set() {
							order.push('first');
						},
					},
					second: {
						set() {
							order.push('second');
						},
					},
				};
			}

			const comp = new TestComp({ second: 'b', first: 'a' });
			expect(order).toEqual(['first', 'second']);
			comp.destroy();
		});
	});

	describe('schema field inheritance', () => {
		test('subclass can opt out of a parent data flag with data: false', () => {
			class Parent extends Component {
				static schema = {
					title: { data: true },
				};
			}

			class Child extends Parent {
				static schema = {
					title: { data: false },
				};
			}

			const parent = new Parent({ title: 'stored-only' });
			const child = new Child({ title: 'routed' });
			expect(parent.elem.title).toBe('');
			expect(child.elem.title).toBe('routed');
			parent.destroy();
			child.destroy();
		});

		test('subclass set without a data field keeps the parent data flag', () => {
			const seen = [];

			class Parent extends Component {
				static schema = {
					title: { data: true },
				};
			}

			class Child extends Parent {
				static schema = {
					title: {
						set(value, next) {
							seen.push(value);
							next(value);
						},
					},
				};
			}

			const child = new Child({ title: 'stored-only' });
			expect(seen).toEqual(['stored-only']);
			expect(child.elem.title).toBe('');
			child.destroy();
		});

		test('subclass can lift a parent enum with enum: null', () => {
			class Parent extends Component {
				static schema = {
					variant: { enum: ['plain'], data: true },
				};
			}

			class Child extends Parent {
				static schema = {
					variant: { enum: null },
				};
			}

			expect(() => new Parent({ variant: 'wild' })).toThrow();
			const child = new Child({ variant: 'wild' });
			expect(child.options.variant).toBe('wild');
			child.destroy();
		});
	});

	describe('schema enum', () => {
		class EnumComp extends Component {
			static schema = {
				variant: { default: 'plain', enum: ['plain', 'fancy'] },
			};
		}

		test('valid values pass on construction and reactive update', () => {
			const comp = new EnumComp({ variant: 'fancy' });
			comp.options.variant = 'plain';
			expect(comp.options.variant).toBe('plain');
			comp.destroy();
		});

		test('invalid values throw with the valid values listed', () => {
			expect(() => new EnumComp({ variant: 'bogus' })).toThrow(
				'"bogus" is not a valid variant. The variant must be one of the following values: plain, fancy',
			);
		});

		test('invalid reactive assignment throws', () => {
			const comp = new EnumComp();
			expect(() => (comp.options.variant = 'bogus')).toThrow();
			comp.destroy();
		});

		test('null and undefined bypass enum validation', () => {
			class OptionalEnumComp extends Component {
				static schema = {
					variant: { enum: ['plain', 'fancy'] },
				};
			}

			const comp = new OptionalEnumComp({ variant: undefined });
			comp.options.variant = null;
			comp.destroy();
		});

		test('optionEnum exposes the declared values, nearest class first', () => {
			class Wider extends EnumComp {
				static schema = {
					variant: { enum: ['plain', 'fancy', 'wild'] },
				};
			}

			const base = new EnumComp();
			const wider = new Wider({ variant: 'wild' });
			expect(base.optionEnum('variant')).toEqual(['plain', 'fancy']);
			expect(wider.optionEnum('variant')).toEqual(['plain', 'fancy', 'wild']);
			expect(base.optionEnum('missing')).toBeUndefined();
			base.destroy();
			wider.destroy();
		});
	});

	describe('before', () => {
		test('a component given before is placed in front of that target, as an Elem is', () => {
			const target = new Component({ textContent: 'target', appendTo: document.body });
			const placed = new Component({ textContent: 'placed', before: target });

			expect(target.elem.compareDocumentPosition(placed.elem) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
			expect(placed.elem).toBeInTheDocument();
		});
	});

	describe('retired 1.x declarations', () => {
		test('a class declaring static handlers or a defaultOptions field is warned of, once per class', async () => {
			const warn = spyOn(console, 'warn').mockImplementation(() => {});

			class Handled extends Component {
				static handlers = { title() {} };
			}
			class Defaulted extends Component {
				defaultOptions = { title: 'untitled' };
			}
			class Declared extends Component {
				static schema = { title: { default: 'untitled' } };
			}

			for (const Klass of [Handled, Handled, Defaulted, Declared]) warnOfRetiredOptions(new Klass());

			await Promise.resolve();

			expect(warn.mock.calls.map(([message]) => message.match(/\w+ declares [^,]+/)?.[0])).toEqual([
				'Handled declares `static handlers`',
				'Defaulted declares a `defaultOptions` class field',
			]);
		});
	});

	describe('static events', () => {
		test('declared events register via on() and fire via emit()', () => {
			const received = [];

			class TestComp extends Component {
				static events = ['activate'];
			}

			const comp = new TestComp({ onActivate: event => received.push(event.detail) });
			comp.emit('activate', 'payload');
			expect(received).toEqual(['payload']);
			comp.destroy();
		});

		test('subclass events union with parent events instead of replacing', () => {
			class Parent extends Component {
				static events = ['open'];
			}

			class Child extends Parent {
				static events = ['close'];
			}

			const received = [];
			const comp = new Child({
				onOpen: () => received.push('open'),
				onClose: () => received.push('close'),
			});
			comp.emit('open');
			comp.emit('close');
			expect(received).toEqual(['open', 'close']);
			comp.destroy();
		});

		test('a camelCase event keeps its case: onSelectDay hears selectDay', () => {
			class TestComp extends Component {
				static events = ['selectDay'];
			}

			const onSelectDay = mock();
			const comp = new TestComp({ onSelectDay });
			comp.emit('selectDay', 'today');
			expect(onSelectDay).toHaveBeenCalledTimes(1);
			expect(onSelectDay.mock.calls[0][0].detail).toBe('today');
			comp.destroy();
		});

		test('focus, focusin and focusout are recognized', () => {
			const comp = new Component({ tag: 'button', appendTo: container });
			const heard = [];

			for (const targetEvent of ['focus', 'focusin', 'focusout']) {
				expect(comp.on({ targetEvent, callback: () => heard.push(targetEvent) })).toBe(true);
			}

			comp.elem.focus();
			comp.elem.blur();
			expect(heard).toEqual(['focus', 'focusin', 'focusout']);
			comp.destroy();
		});

		test('on() warns of an event it does not recognize, instead of dropping it silently', () => {
			const warn = spyOn(console, 'warn').mockImplementation(() => {});
			const comp = new Component();

			expect(comp.on({ targetEvent: 'nonsense', callback: () => {} })).toBe(false);
			expect(warn.mock.calls.some(([message]) => message.includes('"nonsense" is not a recognized event'))).toBe(true);

			warn.mockRestore();
			comp.destroy();
		});
	});

	describe('static prepareOptions', () => {
		test('transforms merged options before processing', () => {
			class TestComp extends Component {
				static schema = {
					label: { default: 'raw' },
				};

				static prepareOptions(options) {
					return { ...options, textContent: `prepared:${options.label}` };
				}
			}

			const comp = new TestComp();
			expect(comp.elem.textContent).toBe('prepared:raw');
			comp.destroy();
		});

		test('sees schema defaults from child classes (merged view)', () => {
			const seen = [];

			class Parent extends Component {
				static prepareOptions(options) {
					seen.push(options.mode);
					return options;
				}
			}

			class Child extends Parent {
				static schema = {
					mode: { default: 'child-mode', data: true },
				};
			}

			const comp = new Child();
			expect(seen).toEqual(['child-mode']);
			comp.destroy();
		});

		test('runs leaf-first so child transforms feed parent hooks', () => {
			const order = [];

			class Parent extends Component {
				static prepareOptions(options) {
					order.push(`parent:${options.stage}`);
					return options;
				}
			}

			class Child extends Parent {
				static prepareOptions(options) {
					order.push(`child:${options.stage}`);
					return { ...options, stage: 'transformed' };
				}
			}

			const comp = new Child({ stage: 'raw', 'data-stage': 'x' });
			expect(order).toEqual(['child:raw', 'parent:transformed']);
			comp.destroy();
		});

		test('receives constructor children', () => {
			let receivedChildren;

			class TestComp extends Component {
				static prepareOptions(options, children) {
					receivedChildren = children;
					return options;
				}
			}

			const comp = new TestComp({}, 'child content');
			expect(receivedChildren).toEqual(['child content']);
			comp.destroy();
		});
	});

	describe('cleanup system', () => {
		test('addCleanup chains - both functions run on processCleanup', () => {
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

	describe('signal', () => {
		test('a listener given the signal ends with the component', () => {
			const comp = new Component({ appendTo: container });
			const onResize = mock();

			window.addEventListener('resize', onResize, { signal: comp.signal });
			comp.destroy();
			window.dispatchEvent(new Event('resize'));

			expect(onResize).not.toHaveBeenCalled();
		});

		test('rendering again ends what the last build started, and the next build gets a live signal', () => {
			const signals = [];

			class Subscriber extends Component {
				build() {
					signals.push(this.signal);
				}
			}

			const comp = new Subscriber({ appendTo: container });

			comp.render();

			expect(signals).toHaveLength(2);
			expect(signals[0].aborted).toBe(true);
			expect(signals[1].aborted).toBe(false);
		});

		test('the signal is the same one throughout a build', () => {
			const comp = new Component({ autoRender: false });

			expect(comp.signal).toBe(comp.signal);
		});
	});

	describe('destroy', () => {
		const settle = () => new Promise(resolve => setTimeout(resolve, 0));

		test('a component in the document hears its own removal once', async () => {
			const onDisconnected = mock();
			const comp = new Component({ appendTo: document.body, onDisconnected });

			comp.destroy();
			await settle();

			expect(onDisconnected).toHaveBeenCalledTimes(1);
		});

		test('components inside it hear it too, nested in plain elements or not', async () => {
			const parent = new Component({ appendTo: document.body });
			const wrapper = document.createElement('div');
			const direct = mock();
			const nested = mock();

			new Component({ appendTo: parent, onDisconnected: direct });
			parent.elem.append(wrapper);
			new Component({ appendTo: wrapper, onDisconnected: nested });

			parent.destroy();
			await settle();

			expect(direct).toHaveBeenCalledTimes(1);
			expect(nested).toHaveBeenCalledTimes(1);
		});

		test('one never in the document hears nothing', async () => {
			const onDisconnected = mock();
			const comp = new Component({ autoRender: false, onDisconnected });

			comp.destroy();
			await settle();

			expect(onDisconnected).not.toHaveBeenCalled();
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

		test('on* method route - onPointerPress calls the component method', () => {
			const handler = mock();
			component = new Component({ tag: 'button', onPointerPress: handler, appendTo: document.body });

			component.elem.click();
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

	describe('pressable', () => {
		test('Enter and Space press it as a click, and only on the element itself', () => {
			const onPointerPress = mock();
			const tile = new Component({ pressable: true, onPointerPress, appendTo: document.body });
			const field = document.createElement('input');

			tile.elem.append(field);
			field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
			expect(onPointerPress).not.toHaveBeenCalled();

			tile.elem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
			tile.elem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
			tile.elem.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));

			expect(onPointerPress).toHaveBeenCalledTimes(2);
			expect(onPointerPress.mock.calls[0][0].type).toBe('click');
			expect(tile.elem.getAttribute('role')).toBe('button');
			expect(tile.elem.tabIndex).toBe(0);

			tile.pressable(false);
			tile.elem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
			expect(onPointerPress).toHaveBeenCalledTimes(2);
			expect(tile.elem.hasAttribute('role')).toBe(false);
			expect(tile.elem.hasAttribute('tabindex')).toBe(false);

			tile.destroy();
		});

		test('a rendered-again element keeps the role and tab stop', () => {
			const tile = new Component({ pressable: true, appendTo: document.body });

			tile.render();

			expect(tile.elem.getAttribute('role')).toBe('button');
			expect(tile.elem.tabIndex).toBe(0);

			tile.destroy();
		});
	});

	describe('onLongPress', () => {
		const held = ms => new Promise(resolve => setTimeout(resolve, ms));
		const pointer = (elem, type, x = 10, y = 10) =>
			elem.dispatchEvent(
				new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y }),
			);

		test('held still for half a second, it fires with the point, and the click that ends it is not a press', async () => {
			const onLongPress = mock();
			const onPointerPress = mock();
			const button = new Component({ tag: 'button', onLongPress, onPointerPress, appendTo: document.body });

			pointer(button.elem, 'pointerdown', 30, 40);
			await held(560);
			pointer(button.elem, 'pointerup', 30, 40);
			button.elem.click();

			expect(onLongPress).toHaveBeenCalledTimes(1);
			expect(onLongPress.mock.calls[0][0].clientX).toBe(30);
			expect(onPointerPress).not.toHaveBeenCalled();
			button.destroy();
		});

		test('the click that ends a long press reaches nothing, so a menu it opened stays open', async () => {
			const heard = mock();
			const item = new Component({ onLongPress: () => {}, appendTo: document.body });

			document.addEventListener('click', heard, true);
			pointer(item.elem, 'pointerdown');
			await held(560);
			pointer(item.elem, 'pointerup');
			item.elem.click();
			document.removeEventListener('click', heard, true);

			expect(heard).not.toHaveBeenCalled();
			item.destroy();
		});

		test('a long press the browser cancels swallows nothing after it: a later click elsewhere, or a right-click', async () => {
			const elsewhere = mock();
			const item = new Component({ onLongPress: () => {}, appendTo: document.body });
			const other = new Component({ tag: 'button', onPointerPress: elsewhere, appendTo: document.body });

			pointer(item.elem, 'pointerdown');
			await held(560);
			pointer(item.elem, 'pointercancel');
			await held(300);
			other.elem.click();

			const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

			item.elem.dispatchEvent(menu);

			expect(elsewhere).toHaveBeenCalledTimes(1);
			expect(menu.defaultPrevented).toBe(false);
			item.destroy();
			other.destroy();
		});

		test('a short press is only a press', async () => {
			const onLongPress = mock();
			const onPointerPress = mock();
			const button = new Component({ tag: 'button', onLongPress, onPointerPress, appendTo: document.body });

			pointer(button.elem, 'pointerdown');
			await held(100);
			pointer(button.elem, 'pointerup');
			button.elem.click();
			await held(500);

			expect(onLongPress).not.toHaveBeenCalled();
			expect(onPointerPress).toHaveBeenCalledTimes(1);
			button.destroy();
		});

		test('moving away while held cancels it', async () => {
			const onLongPress = mock();
			const item = new Component({ onLongPress, appendTo: document.body });

			pointer(item.elem, 'pointerdown', 10, 10);
			pointer(item.elem, 'pointermove', 10, 30);
			await held(560);

			expect(onLongPress).not.toHaveBeenCalled();
			item.destroy();
		});

		test("a touch's own menu while held is this long press, once, and the browser's menu stays shut", async () => {
			const onLongPress = mock();
			const item = new Component({ onLongPress, appendTo: document.body });

			pointer(item.elem, 'pointerdown');
			await held(200);

			const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

			item.elem.dispatchEvent(menu);
			await held(500);

			expect(onLongPress).toHaveBeenCalledTimes(1);
			expect(menu.defaultPrevented).toBe(true);
			item.destroy();
		});
	});
});

describe('classEnum', () => {
	class Badge extends Component {
		static schema = {
			variant: classEnum('variant', ['flat', 'solid']),
			size: classEnum('size', ['small', 'large'], { default: 'small' }),
		};
	}

	test('marks one class of the set, and moves it when the value changes', () => {
		const badge = new Badge({ variant: 'flat' });

		expect(badge.elem).toHaveClass('variant-flat', 'size-small');

		badge.options.variant = 'solid';

		expect(badge.elem).toHaveClass('variant-solid');
		expect(badge.elem).not.toHaveClass('variant-flat');

		badge.options.variant = null;

		expect(badge.elem.className).not.toContain('variant-');
	});

	test('validates against the set, and says what it takes', () => {
		expect(() => new Badge({ variant: 'loud' })).toThrow('"loud" is not a valid variant');
		expect(new Badge().optionEnum('size')).toEqual(['small', 'large']);
	});

	test('classes and set shape what a value does', () => {
		const seen = [];

		class Shaped extends Component {
			static schema = {
				look: classEnum('look', ['a', 'b'], {
					classes: value => ['look', `look-${value}`],
					set(value) {
						seen.push([value, this.hasClass('look')]);
					},
				}),
			};
		}

		const shaped = new Shaped({ look: 'b' });

		expect(shaped.elem).toHaveClass('look', 'look-b');
		expect(seen[0]).toEqual(['b', true]);
	});
});
