import { Elem, Link } from '../..';

// Static imports for build-time markdown
import ComponentReadme from '../build/Component/README.js';
import ContextReadme from '../build/Context/README.js';
import ElemReadme from '../build/Elem/README.js';
import DemoReadme from '../build/demo/README.js';
import GettingStartedReadme from '../build/docs/GETTING_STARTED.js';
import RequestReadme from '../build/request/README.js';
import StyledReadme from '../build/styled/README.js';
import ThemeReadme from '../build/theme/README.js';
import DemoView from '.';

export default class DocumentationView extends DemoView {
	async build() {
		this.elem.style.overflow = 'auto';

		try {
			const markdownMap = {
				'Component/README.md': ComponentReadme,
				'Context/README.md': ContextReadme,
				'Elem/README.md': ElemReadme,
				'demo/README.md': DemoReadme,
				'docs/GETTING_STARTED.md': GettingStartedReadme,
				'request/README.md': RequestReadme,
				'styled/README.md': StyledReadme,
				'theme/README.md': ThemeReadme,
			};

			const markdownPath = this.options.fileName || `${this.options.folderName}/README.md`;
			const readme = markdownMap[markdownPath];

			if (readme) {
				new Elem({ style: { overflow: 'auto' }, innerHTML: readme, appendTo: this.demoWrapper });
			} else {
				console.warn(`No documentation found for ${markdownPath}`);
			}

			if (this.options.nextUrl) {
				new Elem({ tag: 'hr', style: { margin: '32px 0' }, appendTo: this.demoWrapper });

				new Link({
					variant: 'button',
					href: this.options.nextUrl,
					content: `Next: ${this.options.nextLabel}`,
					appendTo: this.demoWrapper,
				});
			}
		} catch (error) {
			console.warn(`No documentation found for ${this.options.folderName || this.options.fileName}`, error);
		}
	}
}
