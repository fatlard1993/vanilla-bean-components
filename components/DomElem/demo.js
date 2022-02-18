import { DomElem } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new DomElem('p', {
			appendTo: this.demoWrapper,
			className: 'domElem',
			textContent: 'A general purpose base element building block',
		});
	}
}
