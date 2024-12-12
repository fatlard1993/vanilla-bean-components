/* eslint-disable spellcheck/spell-checker */
import { Component } from '../Component';
import { Button } from '../Button';

const defaultOptions = { readOnly: false };

class Tag extends Component {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		const onPointerPress = () => {
			if (this.removeButton) {
				this.removeButton.remove();
				this.removeButton = undefined;
			} else this.removeButton = new Button({ icon: 'close', appendTo: this, onPointerPress: () => this.remove() });
		};

		super(
			{
				...options,
				styles: (theme, component) => `
					border: 1px solid ${theme.colors.white};
					padding: 9px;
					margin: 3px;
					display: inline-block;
					float: left;
					border: 2px solid;
					border-radius: 3px;
					border-top-left-radius: 0;
					font-size: 18px;
					background-color: ${theme.colors.black};

					--aug-border-all: 1px;
					--aug-tl1: 4px;
					--aug-bl1: 4px;
					--aug-r1: 3px;
					--aug-r-extend1: 18px;

					&.addTag {
						display: flex;
						flex-direction: row;
						padding: 3px 9px;
						min-width: 260px;
					}

					${options.styles?.(theme, component) || ''}
				`,
				tag: 'li',
				appendTo: options.appendTo,
				onPointerPress: options.readOnly ? () => {} : onPointerPress,
			},
			...children,
		);

		this.elem.setAttribute('data-augmented-ui', 'tl-clip-y r-clip-y bl-clip-y border');
	}
}

export default Tag;
