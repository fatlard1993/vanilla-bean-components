import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Input } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Input({
			type: 'text',
			onKeyUp: event => {
				console.log(event, `isDirty: ${component.isDirty}`);
			},
			onInput: event => {
				console.log(event, `isDirty: ${component.isDirty}`);
			},
			onChange: ({ value: newValue }) => {
				component.options.value = newValue;
				console.log('onChange', { newValue });
			},
			validations: [
				[/.+/, 'This input is required'],
				[/^.{3,5}$/, 'Must be between 3 and 5 characters long'],
				[
					value => value !== component.initialValue.split('').reverse().join(''),
					() => `Must not be the inverse of the initial value: ${component.initialValue}`,
				],
			],
			value: 'value',
			appendTo: this.demoWrapper,
		});

		new DomElem({
			tag: 'p',
			textContent: component.options.subscriber('value', value => `The current value is: ${value}`),
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
