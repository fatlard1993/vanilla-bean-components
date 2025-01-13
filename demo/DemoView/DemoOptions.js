import { Component, List, Select, Input, Label, conditionalList, styled, Code } from '../..';
import { stringifyValue } from './utils';

const CodeForLabel = styled(
	Code,
	() => `
		display: block;
	`,
);

export default class DemoOptions extends List {
	constructor(options) {
		const { component } = options;
		const isMethod = key =>
			typeof component[key] === 'function' ||
			typeof component.elem[key] === 'function' ||
			typeof component.options[key] === 'function';

		super({
			...options,
			addClass: ['noStyle'],
			items: Object.entries(component.options).map(
				([key, value]) =>
					new Label(
						key,
						new List({
							addClass: ['noStyle'],
							items: conditionalList([
								{
									alwaysItem: new Label(
										'Type',
										new CodeForLabel({
											code: stringifyValue(typeof value === 'object' ? value : typeof value),
										}),
									),
								},
								{
									if: !isMethod(key) && component.defaultOptions?.[key] !== undefined,
									thenItem: new Label(
										'Default',
										new CodeForLabel({ code: stringifyValue(component.defaultOptions?.[key]) }),
									),
								},
								{
									if: component[`${key}_enum`] || typeof value === 'boolean',
									thenItem: new Label(
										'Current',
										new Select({
											value: component.options.subscriber?.(key) ?? value,
											options: component[`${key}_enum`] || [
												{ label: 'True', value: true },
												{ label: 'False', value: false },
											],
											onChange:
												typeof value === 'boolean'
													? ({ value: newValue }) => (component.options[key] = newValue === 'true')
													: ({ value: newValue }) => (component.options[key] = newValue),
										}),
									),
								},
								{
									if:
										!isMethod(key) &&
										!component[`${key}_enum`] &&
										typeof value !== 'boolean' &&
										!stringifyValue(value).startsWith('[object HTML') &&
										stringifyValue(value) !== '[object Component]' &&
										stringifyValue(value) !== '[object Elem]',
									thenItem: new Label(
										'Current',
										new Input({
											tag: typeof value === 'object' || value?.includes?.('\n') ? 'textarea' : 'input',
											syntaxHighlighting: typeof value !== 'string' || key === 'code',
											style: { width: '100%' },
											value:
												component.options.subscriber?.(key, _ => {
													try {
														return ['[object Object]', '[object Array]'].includes(stringifyValue(_))
															? JSON.stringify(
																	_,
																	(_key, _value) => {
																		if (_value?._component || _value?.prototype instanceof Component)
																			return '[object Component]';
																		if (typeof _value === 'function') return _value.toString();

																		return _value;
																	},
																	2,
																)
															: _;
													} catch {
														return stringifyValue(_);
													}
												}) ?? value,
											onChange: ({ value: newValue }) => (component.options[key] = newValue),
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
