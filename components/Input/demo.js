import DemoView from '../../demo/DemoView';
import { Input } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Input({
			label: 'myCustomLabel',
			tooltip: { textContent: 'myCustomTooltip', position: 'top' },
			onKeyUp: event => {
				console.log(event);
				// dirtyLabel.elem.children[0].textContent = `isDirty: ${component.isDirty}`;
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
		});

		super({ component, ...options });
	}
}
