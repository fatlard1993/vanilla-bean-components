import { DomElem, Label, TagList } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const tags = ['one', '2', 'three'];

		new TagList({ tags, appendTo: this.demoWrapper });

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- tags [Array(string)] (optional) :: []' }),
				new DomElem({ tag: 'pre', textContent: '- readOnly [boolean] (optional) :: false' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' }),
			],
		});
	}
}
