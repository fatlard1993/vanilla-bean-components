import { Elem } from '../..';
import { GET } from '../../request';

import DemoView from '.';

export default class DocumentationView extends DemoView {
	async render() {
		super.render();

		this.elem.style.overflow = 'auto';

		const response = await GET(`${this.options.folderName}/README.md`);

		if (response.response.ok) {
			new Elem({ style: { overflow: 'auto' }, innerHTML: response.body, appendTo: this.demoWrapper });
		}
	}
}
