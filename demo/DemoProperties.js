import { Code, List, Label, conditionalList, getCustomProperties } from '..';
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
			addClass: 'noStyle',
			items: componentProperties
				.filter(
					key =>
						typeof options.component[key] !== 'function' &&
						key !== 'options' &&
						key !== 'defaultOptions' &&
						!key.startsWith('on'),
				)
				.map(
					key =>
						new Label(
							key,
							new List({
								addClass: 'noStyle',
								items: conditionalList([
									{
										if: Object.isFrozen(options.component[key]) || key === 'elem',
										thenItem: 'READ ONLY',
										elseItem: new Code({ code: stringifyValue(options.component[key]) }),
									},
									{
										alwaysItems: [
											new Label(
												'Type',
												new Code({
													code: stringifyValue(
														typeof options.component[key] === 'object'
															? options.component[key]
															: typeof options.component[key],
													),
												}),
											),
											new Label('Current', new Code({ code: stringifyValue(options.component[key]) })),
										],
									},
								]),
							}),
						),
				),
		});
	}
}
