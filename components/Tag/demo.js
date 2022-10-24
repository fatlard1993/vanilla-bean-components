import { Tag } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const textContent = 'textContent';
		const readOnly = false;

		new Tag({ appendTo: this.demoWrapper, textContent, readOnly });
	}
}
