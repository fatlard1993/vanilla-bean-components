import { Modal, DomElem } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new DomElem('p', { textContent: 'Some background content', appendTo: this.demoWrapper });

		new Modal({ appendTo: this.demoWrapper });
	}
}
