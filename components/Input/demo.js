import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Input } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Input({
			onKeyUp: event => {
				console.log(event, `isDirty: ${component.isDirty}`);
			},
			onInput: event => {
				console.log(event, `isDirty: ${component.isDirty}`);
			},
			onChange: () => component.validate(),
			validations: [
				[/.+/, 'This input is required'],
				[/^.{3,5}$/, 'Must be between 5 and 7 characters long'],
				[
					value => value !== component.initialValue.split('').reverse().join(''),
					value => `Must not be the inverse of the initial value: ${value}`,
				],
			],
			value: 'value',
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
