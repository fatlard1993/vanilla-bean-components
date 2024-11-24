import { TooltipWrapper } from '../TooltipWrapper';

const defaultOptions = { tag: 'a', variant: 'button', tooltip: { icon: 'link', style: { fontSize: '12px' } } };

class Link extends TooltipWrapper {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				onPointerDown: event => event.stopPropagation(),
				onPointerUp: event => event.stopPropagation(),
				styles: (theme, domElem) => `
					${domElem.options.variant === 'button' ? theme.button : ''}

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
