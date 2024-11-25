import { TooltipWrapper } from '../TooltipWrapper';

const defaultOptions = { tag: 'a', variant: 'link', tooltip: { icon: 'link', style: { fontSize: '12px' } } };

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
					&.variant-button {
						${theme.button}
					}

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

	setOption(key, value) {
		if (key === 'variant') {
			this.removeClass(/\bvariant-\S+\b/g);
			this.addClass(`variant-${value}`);
		} else super.setOption(key, value);
	}
}

export default Link;
