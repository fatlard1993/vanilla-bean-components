import { Icon } from '../Icon';

const state_enum = Object.freeze(['auto', 'manual']);

export default class Popover extends Icon {
	state_enum = state_enum;

	constructor({ autoOpen = true, ...options } = {}, ...children) {
		super(
			{
				visualParent: document.body,
				appendTo: document.body,
				state: 'auto',
				...options,
				styles: (theme, domElem) => `
					position: absolute;
					background-color: ${theme.colors.darkest(theme.colors.gray)};
					color: ${theme.colors.white};
					padding: 12px;
					border-radius: 3px;
					border: 1px solid ${theme.colors.lightest(theme.colors.gray)};
					margin: 0;

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);

		this.elem.id = this.classId;
		this.elem.popover = this.options.state;

		if (this.options.x !== undefined && this.options.y !== undefined) this.edgeAwarePlacement(this.options);

		if (autoOpen) requestAnimationFrame(() => this.show());
	}

	edgeAwarePlacement({ x, y, maxHeight = 132, maxWidth = 264, padding = 24, visualParent }) {
		if (!visualParent) visualParent = this.options.visualParent || this.options.appendTo;

		const pastRight = x + maxWidth + padding >= visualParent.clientWidth;
		const pastBottom = y + maxHeight + padding >= visualParent.clientHeight;

		this.elem.style.maxWidth = `${maxWidth}px`;
		this.elem.style.maxHeight = `${maxHeight}px`;
		this.elem.style.top = pastBottom ? 'unset' : `${y}px`;
		this.elem.style.bottom = pastBottom ? `${visualParent.clientHeight - y}px` : 'unset';
		this.elem.style.left = pastRight ? 'unset' : `${x}px`;
		this.elem.style.right = pastRight ? `${visualParent.clientWidth - x}px` : 'unset';
	}

	show(options) {
		if (options) this.edgeAwarePlacement(options);

		this.elem.showPopover();
	}

	hide() {
		this.elem.hidePopover();
	}
}
