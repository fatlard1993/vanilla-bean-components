import { styled } from '../../styled';
import { Icon } from '../Icon';

const state_enum = Object.freeze(['auto', 'manual']);

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
	`,
);

export default class Popover extends StyledIcon {
	state_enum = state_enum;

	constructor({ autoOpen = true, ...options } = {}, ...children) {
		super(
			{
				viewport: document.documentElement,
				appendTo: document.body,
				state: 'auto',
				onConnected: () => {
					if (autoOpen) setTimeout(() => this.show(), 200);
				},
				...options,
			},
			children,
		);

		this.elem.id = this.classId;
		this.elem.popover = this.options.state;

		if (this.options.x !== undefined && this.options.y !== undefined) this.edgeAwarePlacement(this.options);
	}

	edgeAwarePlacement({
		x,
		y,
		maxHeight = 132,
		maxWidth = 264,
		padding = 24,
		viewport = this.options.viewport || this.options.appendTo,
	}) {
		const { left, bottom, right } = (viewport?.elem ?? viewport).getBoundingClientRect();

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
		this.elem.style.top = pastBottom ? 'unset' : `${y}px`;
		this.elem.style.bottom = pastBottom ? `${document.documentElement.clientHeight + 18 - y}px` : 'unset';
		this.elem.style.left = pastRight ? 'unset' : `${x}px`;
		this.elem.style.right = pastRight ? `${document.documentElement.clientWidth + 18 - x}px` : 'unset';
	}

	show(options) {
		if (options) this.edgeAwarePlacement(options);

		this.elem.showPopover();
	}

	hide() {
		this.elem.hidePopover();
	}
}
