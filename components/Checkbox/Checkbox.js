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

class Checkbox extends DomElem {
	render() {
		this.inputElem = new DomElem({
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

		super.render();
	}

	get isDirty() {
		return this.initialValue !== this.value;
	}

	setOption(key, value) {
		if (key === 'value') this.inputElem.elem.checked = !!value;
		else if (key === 'name') {
			if (this.nameElem.elem.childNodes[1]) this.nameElem.elem.childNodes[1].textContent = value;
			else this.nameElem.append(value);
		} else super.setOption(key, value);
	}
}

export default Checkbox;
