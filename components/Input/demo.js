import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Component } from '../../Component';
import { Input } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

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
			appendTo: this.demoWrapper,
		});

		new Component({
			tag: 'p',
			textContent: this.component.options.subscriber(
				'value',
				value => `value: ${value} | valid: ${!this.component.validate()}`,
			),
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
