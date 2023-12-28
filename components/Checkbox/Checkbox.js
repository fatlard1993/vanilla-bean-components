import { styled } from '../../utils';
import { DomElem } from '../DomElem';

const CheckboxLabel = styled(
	DomElem,
	({ colors }) => `
		line-height: 1.1;
		padding-top: 3px;
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
	render(options = this.options) {
		this.inputElem = new CheckboxInput({
			tag: 'input',
			type: 'checkbox',
			id: this.classId,
		});

		this.nameElem = new CheckboxLabel({
			tag: 'label',
			for: this.classId,
			appendTo: this.elem,
			content: [this.inputElem],
		});

		super.render({
			...this.options,
			onChange(event) {
				event.value = event.target.checked;
				this.options.onChange?.(event);
			},
		});
	}

	get value() {
		return this.inputElem.elem.checked;
	}

	set value(value) {
		this.inputElem.elem.checked = !!value;
	}

	get isDirty() {
		return this.initialValue !== this.value;
	}

	setOption(name, value) {
		if (name === 'checked' || name === 'value') this.value = value;
		else if (name === 'name') {
			if (this.nameElem.elem.childNodes[1]) this.nameElem.elem.childNodes[1].textContent = value;
			else this.nameElem.append(value);
		} else super.setOption(name, value);
	}
}

export default Checkbox;
