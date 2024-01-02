import { DomElem, List, Input, Button, Checkbox, Popover } from '../..';

import DemoView, { DemoWrapper } from '../DemoView';

class TodoListItem extends DomElem {
	render() {
		this.initialLabel = this.options.label;

		this._checkbox = new Checkbox({
			name: this.options.subscriber('label'),
			value: this.options.subscriber('checked'),
			styles: () => `
				display: inline-block;
				padding-right: 12px;

				> label {
					${this.options.checked ? 'text-decoration: line-through;' : ''}
				}
			`,
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

		this.content([this._checkbox, this._edit, this._trash]);

		super.render();
	}
}

class Todo extends DomElem {
	constructor(options = {}) {
		super({ items: JSON.parse(localStorage.getItem('todo_items') || '[]'), ...options });
	}

	render() {
		this._list = new List({ items: this.options.subscriber('items'), ListItemComponent: TodoListItem });
		this._input = new Input({ type: 'text', style: { display: 'inline', width: '68%', margin: '1%' } });
		this._add = new Button({
			content: 'Add',
			style: { width: '28%', margin: '1%' },
			onPointerPress: () => {
				this.options.items = [{ label: this._input.value }, ...this.options.items];
				this._input.value = '';
			},
		});

		this.content([this._input, this._add, this._list]);

		super.render();
	}

	setOption(key, value) {
		if (key === 'items') localStorage.setItem('todo_items', JSON.stringify(value));

		super.setOption(key, value);
	}
}

export default class Example extends DemoView {
	render() {
		super.render();

		new DemoWrapper({ appendTo: this }, new Todo());
	}
}
