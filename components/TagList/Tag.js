import DomElem from '../DomElem';
import IconButton from '../IconButton';

export class Tag extends DomElem {
	constructor({ styles = () => '', appendTo, readOnly = false, ...options }) {
		const onPointerPress = () => {
			if (this.removeButton) {
				this.removeButton.remove();
				this.removeButton = undefined;
			} else this.removeButton = new IconButton({ icon: 'close', appendTo: this, onPointerPress: () => this.remove() });
		};

		super({
			styles: ({ colors, ...theme }) => `
				border: 1px solid ${colors.white};
				padding: 6px;
				margin: 3px;
				display: inline-block;
				float: left;
				border: 2px solid;
				border-radius: 3px;
				border-top-left-radius: 0;
				font-size: 18px;
				background-color: ${colors.black};

				&.addTag {
					display: flex;
					flex-direction: row;
					padding: 0 3px;
					border: 1px solid;
					min-width: 260px;

					.DomElem.TextInput {
						display: inline-block;
						flex: 1;
						margin: 3px;
					}
				}

				.DomElem.IconButton {
					width: 30px;
					height: 30px;
					margin: 3px 0 3px 3px;
				}

				${styles({ colors, ...theme })}
			`,
			tag: 'li',
			appendTo,
			onPointerPress: readOnly ? () => {} : onPointerPress,
			...options,
		});
	}
}

export default Tag;
