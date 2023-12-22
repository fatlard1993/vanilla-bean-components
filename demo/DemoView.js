/* eslint-disable spellcheck/spell-checker */
import { DomElem, Label, Link, View, styled } from '..';
import DemoOptions from './DemoOptions';

export const DemoWrapper = styled(
	DomElem,
	({ colors }) => `
		position: relative;
		margin: 5%;
		padding: 5%;
		background: ${colors.darkest(colors.gray)};

		--aug-border-bg: linear-gradient(-12deg, ${colors.light(colors.teal)}, ${colors.light(colors.blue)});
		--aug-border-all: 2px;
		--aug-tl1: 24px;
		--aug-br1: 6px;
	`,
	{
		// eslint-disable-next-line spellcheck/spell-checker
		attributes: { 'data-augmented-ui': 'tl-clip br-clip border' },
	},
);

export default class DemoView extends View {
	constructor(options = {}) {
		super({
			...options,
			styles: (theme, domElem) => `
				display: flex;
				flex-direction: column;
				overflow: auto;

				li {
					white-space: pre;
				}

				${options.styles?.(theme, domElem) || ''}
			`,
		});
	}

	render(options = this.options) {
		if (options.component) {
			const componentAncestors = options.component
				.ancestry()
				.filter(
					({ constructor: { name } }) => name !== options.component.constructor.name && name !== 'VanillaBeanDomElem',
				);

			if (componentAncestors.length > 0) {
				new Label({
					label: 'Ancestors',
					appendTo: this,
					append: componentAncestors.map(
						({ constructor: { name } }) =>
							new Link({
								textContent: name.replace(/\d$/, ''),
								href:
									name === 'EventTarget'
										? 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget'
										: `#/${name.replace(/\d$/, '')}`,
							}),
					),
				});
			}

			new Label(
				{ label: 'Options', appendTo: this },
				new DemoOptions({
					appendTo: this,
					component: options.component,
				}),
			);
		}

		super.render(options);
	}
}
