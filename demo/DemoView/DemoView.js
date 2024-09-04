/* eslint-disable spellcheck/spell-checker */
import { DomElem, Label, Link, View, styled, GET } from '../..';
import DemoOptions from './DemoOptions';

const StyledLabel = styled(
	Label,
	() => `
		width: auto;
		margin: 0 3% 9px;
	`,
	{ collapsible: true },
);

export class DemoView extends View {
	constructor(options = {}) {
		super({
			...options,
			styles: (theme, domElem) => `
				display: flex;
				flex-direction: column;
				overflow-y: auto;
				overflow-x: hidden;

				li {
					white-space: pre;
				}

				${options.styles?.(theme, domElem) || ''}
			`,
		});
	}

	async render() {
		if (this.component) {
			const componentAncestors = this.component
				.ancestry()
				.filter(
					({ constructor: { name } }) => name !== this.component.constructor.name && name !== 'VanillaBeanDomElem',
				);

			const readme = await GET(
				this.component.constructor.name === 'VanillaBeanDomElem'
					? 'DomElem/README.md'
					: `components/${this.component.constructor.name.replace(/\d$/, '')}/README.md`,
			);

			if (readme.response.ok) {
				new StyledLabel({ label: 'README', appendTo: this }, new DomElem({ innerHTML: readme.body.parsed }));
			}

			if (componentAncestors.length > 0) {
				new StyledLabel(
					{ label: 'Ancestors', appendTo: this },
					componentAncestors.map(
						({ constructor: { name } }) =>
							new Link({
								textContent: name.replace(/\d$/, ''),
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
