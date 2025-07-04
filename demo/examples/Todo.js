import { Component, List, Input, Button, Popover, styled } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './Todo.js.asText';

class TodoListItem extends (styled.Component`
	&.checked span {
		text-decoration: line-through;
	}
`) {
	_setOption(key, value) {
		if (key === 'checked') {
			this[value ? 'addClass' : 'removeClass']('checked');
		}
		super._setOption(key, value);
	}

	render() {
		this.initialLabel = this.options.label;

		this._checkbox = new Input({
			type: 'checkbox',
			value: this.options.subscriber('checked'),
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
			this._checkbox,
			this._edit,
			this._trash,
			new Component({ tag: 'span', textContent: this.options.subscriber('label') }),
		]);

		super.render();
	}
}

class Todo extends Component {
	constructor(options = {}) {
		super({ items: JSON.parse(localStorage.getItem('todo_items') || '[]'), ...options });
	}

	render() {
		this._list = new List({ items: this.options.subscriber('items'), ListItemComponent: TodoListItem });
		this._input = new Input({
			type: 'text',
			style: { flex: 1 },
			onChange: ({ value }) => {
				this._input.options.value = value;
			},
		});
		this._add = new Button({
			icon: 'add',
			onPointerPress: () => {
				this.options.items = [{ label: this._input.options.value }, ...this.options.items];
				this._input.options.value = '';
			},
		});

		this.content([
			new Component(
				{ tag: 'fieldset', style: { display: 'flex', border: 'none', gap: '6px', margin: 0 } },
				this._input,
				this._add,
			),
			this._list,
		]);

		super.render();
	}

	_setOption(key, value) {
		if (key === 'items') {
			localStorage.setItem('todo_items', JSON.stringify(value));
		}

		super._setOption(key, value);
	}
}

export default class Example extends ExampleView {
	render() {
		this.options.exampleCode = exampleCode;

		super.render();

		new Todo({ appendTo: this.demoWrapper });
	}
}
