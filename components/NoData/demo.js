import { DomElem, NoData, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const textContent = 'There is no data to display';

		const noData = new NoData({ appendTo: this.demoWrapper, textContent });

		const appendTo = this.demoContent;

		new Label({
			label: 'textContent',
			appendTo,
			appendChild: new TextInput({
				value: textContent,
				onKeyUp: ({ target: { value } }) => (noData.elem.textContent = value),
			}),
		});

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' })],
		});
	}
}
