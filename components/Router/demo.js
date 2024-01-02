import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Router } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Router({ views: [] });

		new DomElem({
			textContent: 'A basic hash based view router',
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
