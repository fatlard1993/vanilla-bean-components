import { DomElem, List, Input, Button, Popover, Label } from '../..';

import DemoView, { DemoWrapper } from '../DemoView';

class TodoListItem extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				styles: (theme, domElem) => `
					label {
						${options.checked ? 'text-decoration: line-through;' : ''}
					}

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);
	}

	render() {
		this.initialLabel = this.options.label;

		this._checkbox = new Input({
			type: 'checkbox',
			value: this.options.subscriber('checked'),
			label: this.options.subscriber('label'),
			onChange: ({ value }) => {
				this.parent.parent.parent.options.items = this.parent.parent.options.items.map(item =>
					item.label === this.initialLabel ? { ...item, checked: value } : item,
				);
			},
		});
		this._edit = new Button({
			icon: 'pencil',
			onPointerPress: ({ clientX, clientY }) => {
				const popover = new Popover(
					{ x: clientX, y: clientY },
					new Input({
						value: this.options.label,
						onKeyUp: ({ target: { value } }) => (this.options.label = value),
						onChange: () => {
							this.parent.parent.parent.options.items = this.parent.parent.options.items.map(item =>
								item.label === this.initialLabel ? { ...item, label: this.options.label } : item,
							);

							popover.elem.remove();
						},
					}),
				);
			},
		});
		this._trash = new Button({
			icon: 'trash-can',
			onPointerPress: () => {
				this.parent.parent.parent.options.items = this.parent.parent.options.items.filter(
					item => item.label !== this.options.label,
				);
			},
		});

		this.content([
			new Label({ label: this.options.subscriber('label'), inline: { after: true } }, this._checkbox),
			this._edit,
			this._trash,
		]);

		super.render();
	}
}

class Todo extends DomElem {
	constructor(options = {}) {
		super({ items: JSON.parse(localStorage.getItem('todo_items') || '[]'), ...options });
	}

	render() {
		this._list = new List({ items: this.options.subscriber('items'), ListItemComponent: TodoListItem });
		this._input = new Input({
			type: 'text',
			onChange: ({ value }) => {
				this._input.options.value = value;
			},
		});
		this._add = new Button({
			icon: 'add',
			style: { position: 'absolute', top: '-16px', right: '-16px' },
			onPointerPress: () => {
				this.options.items = [{ label: this._input.options.value }, ...this.options.items];
				this._input.options.value = '';
			},
		});

		this.content([
			new DomElem(
				{ tag: 'fieldset', style: { border: 'none', padding: 0, margin: 0, position: 'relative' } },
				this._input,
				this._add,
			),
			this._list,
		]);

		super.render();
	}

	setOption(key, value) {
		if (key === 'items') {
			localStorage.setItem('todo_items', JSON.stringify(value));
		}

		super.setOption(key, value);
	}
}

export default class Example extends DemoView {
	render() {
		super.render();

		new DemoWrapper({ appendTo: this }, new Todo());
	}
}
