import { styled } from '../../utils';
import { DomElem } from '../DomElem';

const CheckboxLabel = styled(
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
	`,
);

const CheckboxInput = styled(
	DomElem,
	({ colors }) => `
		/* Remove most all native input styles */
		appearance: none;

		margin: 0;
		margin-right: 6px;
		font: inherit;
		color: currentColor;
		width: 1.15em;
		height: 1.15em;
		border: 0.15em solid currentColor;
		border-radius: 3px;
		transform: translateY(-0.075em);
		display: inline-grid;
		place-content: center;
		cursor: pointer;

		&:before {
			content: "";
			width: 0.65em;
			height: 0.65em;
			border-radius: 2px;
		}

		&:checked:before {
			box-shadow: inset 1em 1em ${colors.blue};
		}

		&:focus {
			border: 0.15em solid currentColor;
		}
	`,
);

class Checkbox extends DomElem {
	constructor(options = {}) {
		super(options);

		this.inputElem = new CheckboxInput({
			tag: 'input',
			type: 'checkbox',
			id: this.classId,
			checked: options.value,
		});

		this.nameElem = new CheckboxLabel({
			tag: 'label',
			for: this.classId,
			appendTo: this.elem,
			append: [this.inputElem, document.createTextNode(options.label)],
		});
	}

	get name() {
		return this.nameElem.elem.childNodes[1].textContent;
	}

	set name(name) {
		this.nameElem.elem.childNodes[1].textContent = name;
	}
}

export default Checkbox;
