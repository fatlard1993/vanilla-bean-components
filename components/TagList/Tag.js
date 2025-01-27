/* eslint-disable spellcheck/spell-checker */
import { Component } from '../../Component';
import { styled } from '../../styled';
import { Button } from '../Button';
import { Popover } from '../Popover';

const StyledComponent = styled(
	Component,
	({ colors }) => `
		padding: 6px 12px 9px 9px;
		margin: 3px;
		display: inline-block;
		float: left;
		font-size: 18px;
		background-color: ${colors.black};
		cursor: pointer;

		--aug-round-tl1: initial;
		--aug-tl1: 3px;
		--aug-clip-tr1: initial;
		--aug-tr1: 6px;
		--aug-clip-bl1: initial;
		--aug-bl1: 9px;
		--aug-round-br1: initial;
		--aug-br1: 6px;
		--aug-border: initial;
		--aug-border-all: 2px;
		--aug-border-bg: ${colors.white};

		&.addTag {
			display: flex;
			flex-direction: row;
			padding: 3px 9px;
			min-width: 260px;
		}

		&:after {
			overflow: visible;
		}

		button {
			position: absolute;
			top: -9px;
			left: -9px;
		}
	`,
);

const defaultOptions = { tag: 'li', readOnly: false, augmentedUI: true };

class Tag extends StyledComponent {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		const onPointerPress = () => {
			if (this.options.readOnly) return;

			if (this.removeButton) {
				this.removeButton.elem.remove();
				this.removeButton = undefined;
			} else {
				const { top, left } = this.elem.getBoundingClientRect();
				this.removeButton = new Popover(
					{
						appendTo: this,
						y: top - 6,
						x: left - 6,
						style: { overflow: 'visible', background: 'none', border: 'none' },
					},
					new Button({
						icon: 'close',
						onPointerPress: () => this.elem.remove(),
					}),
				);
			}
		};

		super({ ...defaultOptions, ...options, onPointerPress }, children);
	}
}

export default Tag;
