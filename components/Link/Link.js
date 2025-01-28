import { TooltipWrapper } from '../TooltipWrapper';

const defaultOptions = { tag: 'a', variant: 'link', tooltip: { icon: 'link', style: { fontSize: '12px' } } };
const variant_enum = Object.freeze(['link', 'button']);

class Link extends TooltipWrapper {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };
	variant_enum = variant_enum;

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				onPointerDown: event => event.stopPropagation(),
				onPointerUp: event => event.stopPropagation(),
			},
			...children,
		);
	}

	_setOption(key, value) {
		if (key === 'variant') {
			this.removeClass(/\bvariant-\S+\b/g);
			this.addClass(`variant-${value}`);
		} else super._setOption(key, value);
	}
}

export default Link;
