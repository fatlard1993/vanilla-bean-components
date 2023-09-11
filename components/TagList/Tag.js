import { DomElem } from '../DomElem';
import { Button } from '../Button';

const defaultOptions = { readOnly: false };

class Tag extends DomElem {
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
				styles: theme => `
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

				&.addTag {
					display: flex;
					flex-direction: row;
					padding: 0 3px;
					min-width: 260px;
				}

				${options.styles?.(theme) || ''}
			`,
				tag: 'li',
				appendTo: options.appendTo,
				onPointerPress: options.readOnly ? () => {} : onPointerPress,
			},
			...children,
		);
	}
}

export default Tag;
