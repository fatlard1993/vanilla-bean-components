/* eslint-disable spellcheck/spell-checker */
import { Elem, Link, View, styled, GET, Label } from '../..';
import DemoOptions from './DemoOptions';

const StyledLabel = styled(
	Label,
	() => `
		width: auto;
		margin: 0 3% 9px;

		label {
			display: block;
		}
	`,
	{ collapsible: true },
);

export class DemoView extends View {
	constructor(options = {}) {
		super({
			...options,
			style: {
				display: 'flex',
				flexDirection: 'column',
				overflowY: 'auto',
				overflowX: 'hidden',
				...options.style,
			},
		});
	}

	async render() {
		if (this.component) {
			const componentAncestors = (this.component.ancestry?.() || []).filter(
				({ constructor: { name } }) =>
					name !== this.component.constructor.name && !name.startsWith('VanillaBean') && name !== 'StyledComponent',
			);

			const readme = await GET(
				`components/${this.component.constructor.name.replace(/\d$/, '').replace('VanillaBean', '')}/README.md`,
			);

			if (readme.response.ok) {
				new StyledLabel(
					{ label: 'README', appendTo: this },
					new Elem({ style: { overflow: 'auto' }, innerHTML: readme.body }),
				);
			}

			if (componentAncestors.length > 0) {
				new StyledLabel(
					{ label: 'Ancestors', appendTo: this },
					componentAncestors.map(
						({ constructor: { name } }) =>
							new Link({
								textContent: name.replace(/\d$/, ''),
								variant: 'button',
								href:
									name === 'EventTarget'
										? 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget'
										: `#/${name.replace(/\d$/, '')}`,
							}),
					),
				);
			}

			new StyledLabel(
				{ label: 'Options', appendTo: this },
				new DemoOptions({
					appendTo: this,
					component: this.component,
				}),
			);
		}

		super.render();
	}
}
