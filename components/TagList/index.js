import './index.css';

import DomElem from '../DomElem';

import TextInput from '../TextInput';
import IconButton from '../IconButton';
import Tag from './Tag';

export { Tag };

export class TagList extends DomElem {
	constructor({ tags = [], readOnly = false, ...options }) {
		let tagInput, addTag, addButton;

		if (!readOnly) {
			tagInput = new TextInput({
				placeholder: 'New Tag',
				onKeyUp: () => {
					addTag.elem.style.width = `${Math.max(
						260,
						tagInput.elem.value.length * Math.round(parseInt(window.getComputedStyle(tagInput.elem).fontSize) * 0.75),
					)}px`;
				},
			});
			addButton = new IconButton({
				icon: 'plus',
				onPointerPress: () => {
					const tags = Array.from(this.elem.children).map(elem => elem.textContent);

					if (tagInput.elem.value.length < 2 || tags.includes(tagInput.elem.value)) return;

					const newTag = new Tag({ textContent: tagInput.elem.value });

					this.elem.insertBefore(newTag.elem, addTag.elem);

					tagInput.elem.value = '';

					tagInput.elem.focus();
				},
			});
			addTag = new Tag({
				readOnly: true,
				className: 'addTag',
				appendChildren: [tagInput, addButton],
			});
		}

		super({
			tag: 'ul',
			appendChildren: [...tags.map(textContent => new Tag({ readOnly, textContent })), ...(addTag ? [addTag] : [])],
			...options,
		});

		this.tagInput = tagInput;
		this.addButton = addButton;
		this.addTag = addTag;
	}
}

export default TagList;
