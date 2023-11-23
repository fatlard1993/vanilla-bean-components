import { DomElem, Label, Link, View, styled } from '..';
import DemoOptions from './DemoOptions';

export const DemoWrapper = styled(
	DomElem,
	() => `
		position: relative;
		border: 1px solid;
		margin: 5%;
		padding: 5%;
	`,
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
						new Link({ textContent: name.replace(/\d$/, ''), href: `#/${name.replace(/\d$/, '')}` }),
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

		super.render(options);
	}
}
