import { DomElem, Input, Label } from '..';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const appendTo = this.demoContent;

		const input = new Input({
			appendTo: this.demoWrapper,
			onKeyUp: evt => {
				console.log(evt);
				dirtyLabel.elem.children[0].textContent = `isDirty: ${input.isDirty()}`;
			},
			onChange: console.log,
			value: 'value',
		});

		const dirtyLabel = new Label({
			label: 'isDirty: false',
			appendTo,
		});

		new Label({
			label: 'onChange: console.log',
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
