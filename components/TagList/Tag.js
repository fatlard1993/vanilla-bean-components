import { Component } from '../../Component';
import { styled } from '../../styled';
import { Button } from '../Button';
import { Elem } from '../../Elem';

const StyledComponent = styled(
	Component,
	({ colors }) => `
		padding: 3px 6px;
		margin: 0;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.85em;
		line-height: 1;
		background-color: ${colors.black};
		border: 1px solid ${colors.alpha(colors.teal, 0.35)};
		border-radius: 3px;
		white-space: nowrap;
		user-select: none;
		cursor: default;
		list-style: none;

		&:not(.readOnly):not(.add-tag):hover {
			border-color: ${colors.light(colors.teal)};
		}

		&.add-tag {
			padding: 0;
			border: none;
			background: none;
			gap: 4px;
			cursor: text;
		}

		&:not(.add-tag) button {
			width: 14px !important;
			height: 14px !important;
			font-size: 8px;
			opacity: 0.4;
			flex-shrink: 0;
			background: transparent !important;

			&:after { display: none; }

			&:hover, &:focus {
				opacity: 0.9;
				background: transparent !important;
				top: -1px;
			}
		}
	`,
);

const defaultOptions = { tag: 'li', readOnly: false };

class Tag extends StyledComponent {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super({ tabindex: '0', ...defaultOptions, ...options }, ...children);
	}

	build() {
		this._textSpan = new Elem({ tag: 'span', appendTo: this });

		if (!this.options.readOnly) {
			new Button({
				icon: 'close',
				appendTo: this,
				onPointerPress: () => this.destroy(),
			});
		}
	}

	static handlers = {
		textContent(value) {
			this.elem.setAttribute('data-value', value);
			this._textSpan.elem.textContent = value;
		},
	};
}

export default Tag;
