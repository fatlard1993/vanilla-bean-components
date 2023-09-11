import { DomElem, Label, Link, List, View, getCustomProperties, styled } from '..';
import DemoOptions from './DemoOptions';
import DemoProperties from './DemoProperties';

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
			styles: theme => `
				display: flex;
				flex-direction: column;
				overflow: auto;

				li {
					white-space: pre;
				}

				${options.styles?.(theme) || ''}
			`,
		});
	}

	render(options = this.options) {
		const componentAncestors = options.component
			.ancestry()
			.filter(({ constructor: { name } }) => name !== options.component.constructor.name);

		const ancestorProperties = new Set(componentAncestors.flatMap(ancestor => getCustomProperties(ancestor)));
		const componentProperties = getCustomProperties(options.component).filter(key => !ancestorProperties.has(key));
		const componentMethods = componentProperties.filter(key => typeof options.component[key] === 'function');

		if (componentAncestors.length > 0) {
			new Label({
				appendTo: this,
				append: componentAncestors.map(
					({ constructor: { name } }) => new Link({ textContent: name, href: `#/${name}` }),
				),
			});
		}

		new DemoOptions({
			appendTo: this,
			component: options.component,
		});

		new DemoProperties({
			appendTo: this,
			component: options.component,
		});

		if (componentMethods.length > 0) {
			new List({
				appendTo: this,
				items: componentMethods.map(key => ({ textContent: key })),
			});
		}

		super.render(options);
	}
}
