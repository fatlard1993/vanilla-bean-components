import { Elem } from '../..';
import { GET } from '../../request';

import DemoView, { DemoWrapper } from '.';

export default class DocumentationView extends DemoView {
	async render() {
		super.render();

		const wrapper = new DemoWrapper({ appendTo: this });

		const response = await GET(`${this.options.folderName}/README.md`);

		if (response.response.ok) {
			new Elem({ style: { overflow: 'auto' }, innerHTML: response.body, appendTo: wrapper });
		}
	}
}
