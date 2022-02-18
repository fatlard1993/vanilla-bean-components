import { Modal } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new Modal({ appendTo: this.demoWrapper });
	}
}
