import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { readFile } from '../../utils';
import { Input } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Input({
			type: 'text',
			onKeyUp: event => {
				console.log('onKeyUp', event, `isDirty: ${this.component.isDirty}`);
			},
			onInput: event => {
				console.log('onInput', event, `isDirty: ${this.component.isDirty}`);
			},
			onChange: ({ value: newValue }) => {
				this.component.options.value = newValue;
				console.log('onChange', { newValue });
			},
			validations: [
				[/.+/, 'This input is required'],
				[/^.{3,5}$/, 'Must be between 3 and 5 characters long'],
				[
					value => value !== this.component.initialValue.split('').reverse().join(''),
					() => `Must not be the inverse of the initial value: ${this.component.initialValue}`,
				],
			],
			value: 'value',
			placeholder: 'placeholder',
		});

		new Component({
			tag: 'p',
			textContent: this.component.options.subscriber(
				'value',
				value => `value: ${value} | valid: ${!this.component.validate()}`,
			),
			appendTo: this.demoWrapper,
		});

		const dropZone = new Component({
			textContent: 'Drop or paste a .txt or .csv here, or tap to choose',
			style: {
				margin: '18px 0 6px',
				padding: '24px',
				border: '2px dashed currentColor',
				textAlign: 'center',
				cursor: 'pointer',
			},
			appendTo: this.demoWrapper,
		});
		const dropped = new Component({ tag: 'pre', appendTo: this.demoWrapper });

		new Input({
			type: 'file',
			accept: '.txt,.csv',
			style: { display: 'none' },
			dropZone,
			onFiles: async ([file]) => {
				dropped.elem.textContent = `${file.name}\n${(await readFile(file)).slice(0, 400)}`;
			},
			appendTo: dropZone,
		});
	}
}
