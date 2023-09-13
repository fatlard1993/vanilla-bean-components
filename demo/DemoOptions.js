import { Code, List, Select, Textarea, Label, conditionalList } from '..';
import { stringifyValue } from './utils';

export default class DemoOptions extends List {
	constructor(options) {
		const isMethod = key =>
			typeof options.component[key] === 'function' || typeof options.component.elem[key] === 'function';

		super({
			...options,
			addClass: 'noStyle',
			items: Object.entries(options.component.options).map(
				([key, value]) =>
					new Label(
						key,
						new List({
							addClass: 'noStyle',
							items: conditionalList([
								{
									alwaysItem: new Label(
										'Type',
										new Code({
											code: stringifyValue(typeof value === 'object' ? value : typeof value),
										}),
									),
								},
								{
									if: !isMethod(key) && options.component.defaultOptions[key],
									thenItem: new Label(
										'Default',
										new Code({ code: stringifyValue(options.component.defaultOptions[key]) }),
									),
								},
								{
									if: isMethod(key) && !options.component[`${key}_enum`],
									thenItem: new Label('Current', new Code({ code: stringifyValue(value) })),
								},
								{
									if: options.component[`${key}_enum`],
									thenItem: new Label(
										'Current',
										new Select({
											value,
											options: options.component[`${key}_enum`],
											onChange: ({ value: newValue }) => (options.component.options[key] = newValue),
										}),
									),
								},
								{
									if: !isMethod(key) && !options.component[`${key}_enum`],
									thenItem: new Label(
										'Current',
										new Textarea({
											value: stringifyValue(value),
											onChange: ({ value: newValue }) => (options.component.options[key] = newValue),
										}),
									),
								},
							]).map(append => ({ append })),
						}),
					),
			),
		});
	}
}
