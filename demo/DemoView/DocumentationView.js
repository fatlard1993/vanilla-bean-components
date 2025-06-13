import { Elem, Link } from '../..';
import { GET } from '../../request';

import DemoView from '.';

export default class DocumentationView extends DemoView {
	async render() {
		super.render();

		this.elem.style.overflow = 'auto';

		const response = await GET(this.options.fileName || `${this.options.folderName}/README.md`);

		if (response.response.ok) {
			new Elem({ style: { overflow: 'auto' }, innerHTML: response.body, appendTo: this.demoWrapper });

			if (this.options.nextUrl) {
				new Elem({ tag: 'hr', style: { margin: '32px 0' }, appendTo: this.demoWrapper });

				new Link({
					variant: 'button',
					href: this.options.nextUrl,
					content: `Next: ${this.options.nextLabel}`,
					appendTo: this.demoWrapper,
				});
			}
		}
	}
}
