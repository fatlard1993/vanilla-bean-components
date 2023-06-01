import { DomElem, Checkbox, Label } from '..';
import DemoView from '../../demo/DemoView';
import { getCustomProps } from '../../utils';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const checkbox = new Checkbox({
			appendTo: this.demoWrapper,
			label: 'enabled',
			value: true,
			onChange: ({ target: { checked } }) => {
				checkbox.name = checked ? 'enabled' : 'disabled';
			},
		});

		const appendTo = this.demoContent;

		new Label({
			label: 'Ancestry',
			appendTo,
			appendChildren: [...new Set(checkbox.ancestry().map(({ constructor: { name } }) => name))].map(
				name => new DomElem({ tag: 'pre', textContent: `- ${name}` }),
			),
		});

		new Label({
			label: 'Props',
			appendTo,
			appendChildren: getCustomProps(checkbox).map(prop => new DomElem({ tag: 'pre', textContent: `- ${prop}` })),
		});
	}
}
