import { GET } from '@vanilla-bean/hypertether';
import { Elem, Link, Label, styled } from '../..';

import ComponentReadme from '../../Component/README.md';
import ElemReadme from '../../Elem/README.md';
import DemoReadme from '../README.md';
import GettingStartedReadme from '../../docs/GETTING_STARTED.md';
import StyledReadme from '../../styled/README.md';
import ThemeReadme from '../../theme/README.md';
import UtilsReadme from '../../utils/README.md';
import DemoView from '.';

const StyledLabel = styled(
	Label,
	() => `
		display: block;
		width: auto;
		margin: 0 1% 9px;

		label {
			display: block;
		}
	`,
);

export default class DocumentationView extends DemoView {
	async build() {
		this.elem.style.overflowY = 'auto';
		this.elem.style.overflowX = 'hidden';
		this.elem.style.minHeight = '0';

		try {
			const markdownMap = {
				'Component/README.md': ComponentReadme,
				'Elem/README.md': ElemReadme,
				'demo/README.md': DemoReadme,
				'docs/GETTING_STARTED.md': GettingStartedReadme,
				'styled/README.md': StyledReadme,
				'theme/README.md': ThemeReadme,
				'utils/README.md': UtilsReadme,
			};

			const markdownPath = this.options.fileName || `${this.options.folderName}/README.md`;
			const readme = markdownMap[markdownPath];
			const html = readme ?? (await GET(markdownPath).then(r => (r.response.ok ? r.body : null)));

			if (html) {
				new StyledLabel(
					{ label: 'README', style: { marginTop: '2%' }, appendTo: this },
					new Elem({ style: { overflow: 'auto' }, innerHTML: html }),
				);
			} else {
				console.warn(`No documentation found for ${markdownPath}`);
			}

			if (this.options.nextUrl) {
				new Elem({
					style: { margin: '0 4% 2%', display: 'block' },
					appendTo: this,
				}).content(
					new Link({
						variant: 'button',
						href: this.options.nextUrl,
						content: `Next: ${this.options.nextLabel}`,
					}),
				);
			}
		} catch (error) {
			console.warn(`No documentation found for ${this.options.folderName || this.options.fileName}`, error);
		}
	}
}
