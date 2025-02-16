import { styled } from '../../styled';
import { Icon } from '../Icon';

const StyledIcon = styled(
	Icon,
	({ colors }) => `
		position: absolute;
		background-color: ${colors.darkest(colors.gray)};
		color: ${colors.white};
		padding: 12px;
		border-radius: 3px;
		border: 1px solid ${colors.lightest(colors.gray)};
		margin: 0;

		&:popover-open {
			display: flex;
		}
	`,
);

const defaultOptions = { uniqueId: true, state: 'manual', viewport: document.documentElement, appendTo: document.body };
const state_enum = Object.freeze(['auto', 'manual']);

export default class Popover extends StyledIcon {
	defaultOptions = defaultOptions;
	state_enum = state_enum;

	constructor({ autoOpen = true, ...options } = {}, ...children) {
		super(
			{
				...defaultOptions,
				onConnected: () => {
					if (autoOpen) setTimeout(() => this.show(), 200);
				},
				...options,
			},
			children,
		);

		if (this.options.x !== undefined && this.options.y !== undefined) this.edgeAwarePlacement(this.options);
	}

	_setOption(key, value) {
		if (key === 'state') this.elem.popover = value;
		else super._setOption(key, value);
	}

	edgeAwarePlacement({
		x,
		y,
		maxHeight = this.options.maxHeight ?? 132,
		maxWidth = this.options.maxWidth ?? 264,
		padding = 24,
		viewport = this.options.viewport || this.options.appendTo,
	}) {
		const { left, bottom, right } = (viewport?.elem ?? viewport).getBoundingClientRect();

		const cursorOffset = 12;

		let pastRight = x + maxWidth + padding >= right;
		const pastLeft = x - maxWidth + padding <= left;
		const pastBottom = y + maxHeight + padding >= bottom;
		// const pastTop = y - maxHeight + padding <= top;

		if (pastLeft && pastRight) {
			x = padding;
			pastRight = false;
		}

		this.elem.style.maxWidth = `${maxWidth}px`;
		this.elem.style.maxHeight = `${maxHeight}px`;
		this.elem.style.top = pastBottom ? 'unset' : `${y + cursorOffset}px`;
		this.elem.style.bottom = pastBottom ? `${document.documentElement.clientHeight + cursorOffset - y}px` : 'unset';
		this.elem.style.left = pastRight ? 'unset' : `${x + cursorOffset}px`;
		this.elem.style.right = pastRight ? `${document.documentElement.clientWidth + cursorOffset - x}px` : 'unset';
	}

	show(options) {
		if (options) this.edgeAwarePlacement(options);

		this.elem.showPopover();
	}

	hide() {
		this.elem.hidePopover();
	}

	get isOpen() {
		return this.elem.matches(':popover-open');
	}
}
