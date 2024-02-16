import { Button } from '../Button';

const defaultOptions = { tag: 'a', tooltip: { icon: 'link', style: { fontSize: '12px' } } };

class Link extends Button {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				onPointerDown: event => event.stopPropagation(),
				onPointerUp: event => event.stopPropagation(),
				styles: (theme, domElem) => `
				&.disabled {
					pointer-events: none;

					&:hover .tooltip {
						display: none;
					}
				}

				${options.styles?.(theme, domElem) || ''}
			`,
			},
			...children,
		);
	}
}

export default Link;
