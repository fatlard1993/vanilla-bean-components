import { DomElem, Menu, Label } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		new Menu({
			appendTo: this.demoWrapper,
			items: [{ textContent: 'one' }, { textContent: 'two' }, { textContent: 'three' }],
			onSelect: console.log,
			style: { width: '60px' },
		});

		new Label({
			label: 'onSelect: console.log',
			appendTo: this.demoContent,
		});

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- items [array] (required)' }),
				new DomElem({ tag: 'pre', textContent: '- onSelect [function] (optional) :: () => {}' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' }),
			],
		});
	}
}
