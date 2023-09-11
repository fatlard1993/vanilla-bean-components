import { Code, List, Select, Textarea, conditionalList } from '..';
import { stringifyValue } from './utils';

export default class DemoOptions extends List {
	constructor(options) {
		const isMethod = key =>
			typeof options.component[key] === 'function' || typeof options.component.elem[key] === 'function';

		super({
			...options,
			items: Object.entries(options.component.options).map(([key, value]) => ({
				append: [
					key,
					new List({
						items: conditionalList([
							{ if: isMethod(key), thenItem: 'METHOD' },
							{
								if: !isMethod(key),
								thenItems: [
									'Type: ',
									new Code({ code: stringifyValue(typeof value === 'object' ? value.toString() : typeof value) }),
								],
							},
							{
								if: !isMethod(key) && options.component.defaultOptions[key],
								thenItems: ['Default: ', new Code({ code: stringifyValue(options.component.defaultOptions[key]) })],
							},
							{
								if: isMethod(key) && !options.component[`${key}_enum`],
								thenItems: ['Current: ', new Code({ code: stringifyValue(value) })],
							},
							{
								if: options.component[`${key}_enum`],
								thenItems: [
									'Current: ',
									new Select({
										value,
										options: options.component[`${key}_enum`],
										onChange: ({ value: newValue }) => options.component.setOption(key, newValue),
									}),
								],
							},
							{
								if: !isMethod(key) && !options.component[`${key}_enum`],
								thenItems: [
									'Current: ',
									new Textarea({
										value: stringifyValue(value),
										onChange: ({ value: newValue }) => options.component.setOption(key, newValue),
									}),
								],
							},
						]).map(append => ({ append })),
					}),
				],
			})),
		});
	}
}
