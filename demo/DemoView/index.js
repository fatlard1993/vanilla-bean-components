import './index.css';

import { DomElem, View } from '../../';
import DemoMenu from '../DemoMenu';

export default class DemoView extends View {
	constructor({ className, ...rest }) {
		super({ className: ['demoView', className], ...rest });

		const appendTo = this.elem;

		this.demoMenu = new DemoMenu({ appendTo });

		this.demoWrapper = new DomElem('div', { className: 'demoWrapper', appendTo });
	}
}
