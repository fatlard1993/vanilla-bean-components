import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Input } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Input({
			type: 'text',
			onKeyUp: event => {
				console.log(event, `isDirty: ${this.component.isDirty}`);
			},
			onInput: event => {
				console.log(event, `isDirty: ${this.component.isDirty}`);
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
			appendTo: this.demoWrapper,
		});

		new DomElem({
			tag: 'p',
			textContent: this.component.options.subscriber('value', value => `The current value is: ${value}`),
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
