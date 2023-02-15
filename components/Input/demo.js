import { DomElem, Input, Label } from '..';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const appendTo = this.demoContent;

		const input = new Input({
			appendTo: this.demoWrapper,
			label: 'myCustomLabel',
			onKeyUp: evt => {
				console.log(evt);
				dirtyLabel.elem.children[0].textContent = `isDirty: ${input.isDirty}`;
			},
			onChange: () => input.validate(),
			validations: [
				[/.+/, 'This input is required'],
				[/^.{3,5}$/, 'Must be between 5 and 7 characters long'],
				[
					value => value !== input.initialValue.split('').reverse().join(''),
					value => `Must not be the inverse of the initial value: ${value}`,
				],
			],
			value: 'value',
		});

		const dirtyLabel = new Label({
			label: 'isDirty: false',
			appendTo,
		});

		new Label({
			label: 'onChange: validate()',
			appendTo,
		});

		new Label({
			label: 'onKeyUp: console.log',
			appendTo,
		});

		new Label({
			label: 'Props',
			appendTo,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- value [string] (optional) :: ""' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' }),
			],
		});
	}
}
