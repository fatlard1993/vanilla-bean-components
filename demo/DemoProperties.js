import { Code, List, conditionalList, getCustomProperties } from '..';
import { stringifyValue } from './utils';

export default class DemoProperties extends List {
	constructor(options) {
		const componentAncestors = options.component
			.ancestry()
			.filter(({ constructor: { name } }) => name !== options.component.constructor.name);

		const ancestorProperties = new Set(componentAncestors.flatMap(ancestor => getCustomProperties(ancestor)));
		const componentProperties = getCustomProperties(options.component).filter(key => !ancestorProperties.has(key));

		super({
			...options,
			items: componentProperties
				.filter(key => typeof options.component[key] !== 'function' && key !== 'options' && key !== 'defaultOptions')
				.map(key => ({
					append: [
						key,
						new List({
							items: conditionalList([
								{
									if: Object.isFrozen(options.component[key]) || key === 'elem',
									thenItem: 'READ ONLY',
									elseItem: new Code({
										code: stringifyValue(options.component[key]),
									}),
								},
								{
									alwaysItems: [
										`Type: ${
											typeof options.component[key] === 'object'
												? options.component[key].toString()
												: typeof options.component[key]
										}`,
										'Current: ',
										new Code({ code: stringifyValue(options.component[key]) }),
									],
								},
							]).map(append => ({
								append,
								styles: () => `white-space: pre;`,
							})),
						}),
					],
				})),
		});
	}
}
