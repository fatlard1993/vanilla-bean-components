import {
	Code,
	DomElem,
	Label,
	Link,
	List,
	Select,
	Textarea,
	View,
	getCustomProperties,
	removeExcessIndentation,
} from '..';
import DemoMenu from './DemoMenu';

const stringifyValue = value => {
	if (typeof value === 'string') return value;

	const string = JSON.stringify(
		value,
		(_key, _value) => {
			if (value === undefined) return 'undefined';
			if (_value instanceof Set) return [..._value];
			if (_value instanceof DomElem || DomElem.isPrototypeOf(_value)) return '[object DomElem]';
			if (typeof _value?.toString === 'function') return _value.toString();
			return _value;
		},
		2,
	);

	return removeExcessIndentation(
		(string || '').replaceAll('\\t', '\t').replaceAll('\\n', '\n').replaceAll(/^"|"$/g, ''),
	);
};

const initializedOnly = new Set(['tag', 'knownAttributes', 'autoRender']);

export default class DemoView extends View {
	constructor(options = {}) {
		super({
			...options,
			styles: theme => `
				display: flex;
				flex-direction: column;

				li {
					white-space: pre;
				}

				${options.styles ? options.styles(theme) : ''}
			`,
		});

		const appendTo = this;
		const { component } = options;

		this.demoMenu = new DemoMenu({ appendTo });

		this.demoContent = new DomElem({
			styles: () => `
				flex: 1;
				overflow: auto;
			`,
			appendTo,
		});

		this.demoWrapper = new DomElem({
			styles: () => `
				position: relative;
				border: 1px solid;
				margin: 5%;
				padding: 5%;
			`,
			appendTo: this.demoContent,
			append: component,
		});

		const componentAncestors = component
			.ancestry()
			.filter(({ constructor: { name } }) => name !== component.constructor.name);

		const ancestorProperties = new Set(componentAncestors.flatMap(ancestor => getCustomProperties(ancestor)));
		const componentProperties = getCustomProperties(component).filter(key => !ancestorProperties.has(key));
		const componentMethods = componentProperties.filter(key => typeof component[key] === 'function');

		if (componentAncestors.length > 0) {
			new Label({
				label: 'Ancestry',
				appendTo: this.demoContent,
				content: componentAncestors.map(
					({ constructor: { name } }) => new Link({ textContent: name, href: `#/${name}` }),
				),
			});
		}

		const isMethod = key => typeof component[key] === 'function' || typeof component.elem[key] === 'function';

		new List({
			label: 'Options',
			appendTo: this.demoContent,
			items: Object.entries(component.options).map(([key, value]) => ({
				content: [
					document.createTextNode(key),
					new List({
						items: [
							...(initializedOnly.has(key) ? ['INITIALIZED ONLY'] : []),
							...(isMethod(key) ? ['METHOD'] : []),
							...(initializedOnly.has(key) || isMethod(key)
								? []
								: [
										component[`${key}_enum`]
											? new Select({
													value,
													options: component[`${key}_enum`],
													onChange: ({ value: newValue }) => component.setOption(key, newValue),
											  })
											: new Textarea({
													label: 'Current',
													value: stringifyValue(value),
													onChange: ({ value: newValue }) => component.setOption(key, newValue),
											  }),
								  ]),
							[
								document.createTextNode('Type: '),
								new Code({ code: stringifyValue(typeof value === 'object' ? value.toString() : typeof value) }),
							],
							[document.createTextNode('Default: '), new Code({ code: stringifyValue(component.defaultOptions[key]) })],
							[document.createTextNode('Current: '), new Code({ code: stringifyValue(value) })],
						].map(content => ({ content })),
					}),
				],
			})),
		});

		new List({
			label: 'Properties',
			appendTo: this.demoContent,
			items: componentProperties
				.filter(key => typeof component[key] !== 'function' && key !== 'options' && key !== 'defaultOptions')
				.map(key => ({
					content: [
						document.createTextNode(key),
						new List({
							items: [
								...(Object.isFrozen(component[key]) || key === 'elem'
									? ['READ ONLY']
									: [
											new Textarea({
												label: 'Current',
												value: stringifyValue(component[key]),
												onChange: ({ value: newValue }) => component.setOption(key, newValue),
											}),
									  ]),
								`Type: ${typeof component[key] === 'object' ? component[key].toString() : typeof component[key]}`,
								[document.createTextNode('Current: '), new Code({ code: stringifyValue(component[key]) })],
							].map(data => ({
								content: data,
								styles: () => `white-space: pre;`,
							})),
						}),
					],
				})),
		});

		if (componentMethods.length > 0) {
			new List({
				label: 'Methods',
				appendTo: this.demoContent,
				items: componentMethods.map(key => ({ textContent: key })),
			});
		}
	}
}
