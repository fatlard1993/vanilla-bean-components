import { styled } from '../../utils';
import { DomElem } from '../DomElem';

const RadioButtonLabel = styled(
	DomElem,
	({ colors }) => `
		line-height: 1.1;
		display: grid;
		grid-template-columns: 1em auto;
		gap: 0.5em;
		width: fit-content;
		cursor: pointer;

		&:focus-within {
			color: ${colors.blue};
		}

		& + label {
			margin-top: 1em;
		}
	`,
);

const RadioButtonInput = styled(
	DomElem,
	({ colors }) => `
		/* Remove most all native input styles */
		appearance: none;

		margin: 0;
		font: inherit;
		color: currentColor;
		width: 1.15em;
		height: 1.15em;
		border: 0.15em solid currentColor;
		border-radius: 50%;
		transform: translateY(-0.075em);
		display: grid;
		place-content: center;
		cursor: pointer;

		&:before {
			content: "";
			width: 0.65em;
			height: 0.65em;
			border-radius: 50%;
		}

		&:checked:before {
			box-shadow: inset 1em 1em ${colors.blue};
		}

		&:focus {
			box-shadow: inset 1em 1em ${colors.blue};
		}
	`,
);

class RadioButton extends DomElem {
	constructor(options) {
		super(options);

		this._options = options.options.map(
			option =>
				new RadioButtonLabel({
					tag: 'label',
					appendTo: this.elem,
					append: [
						new RadioButtonInput({
							tag: 'input',
							type: 'radio',
							value: option?.value || option,
							name: this.classId,
							checked: options.value === (option?.value || option),
						}),
						document.createTextNode(option?.label || option),
					],
				}),
		);
	}
}

export default RadioButton;
