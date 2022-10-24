import { NoData, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

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
	}
}
