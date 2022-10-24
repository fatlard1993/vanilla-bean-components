import { DomElem, View } from '..';
import DemoMenu from './DemoMenu';

export default class DemoView extends View {
	constructor(options) {
		super(options);

		const appendTo = this;

		this.demoMenu = new DemoMenu({ appendTo });

		this.demoContent = new DomElem({ className: 'demoContent', appendTo });

		this.demoWrapper = new DomElem({ className: 'demoWrapper', appendTo: this.demoContent });
	}
}
