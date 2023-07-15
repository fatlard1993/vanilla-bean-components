import { styled } from '../../utils';
import { DomElem } from '../DomElem';
import { TextInput } from '../TextInput';
import { IconButton } from '../IconButton';

import Tag from './Tag';

const TagListTextInput = styled(
	TextInput,
	() => `
		display: inline-block;
		flex: 1;
		margin: 3px;
	`,
);

const TagListIconButton = styled(
	IconButton,
	() => `
		width: 30px;
		height: 30px;
		margin: 3px 0 3px 3px;
	`,
);

const defaultOptions = { readOnly: false };

class TagList extends DomElem {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}) {
		let tagInput, addTag, addButton;

		if (!options.readOnly) {
			tagInput = new TagListTextInput({
				placeholder: 'New Tag',
				onKeyUp: () => {
					addTag.elem.style.width = `${Math.max(
						260,
						tagInput.elem.value.length *
							Math.round(Number.parseInt(window.getComputedStyle(tagInput.elem).fontSize) * 0.75),
					)}px`;
				},
			});
			addButton = new TagListIconButton({
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
				addClass: 'addTag',
				append: [tagInput, addButton],
			});
		}

		super({
			...options,
			tag: 'ul',
			styles: theme => `
				background-color: ${theme.colors.darkest(theme.colors.gray)};
				margin: 1% auto;
				border-radius: 3px;
				box-sizing: border-box;
				border: inset 2px ${theme.colors.light(theme.colors.gray)};
				min-height: 1em;

				&:after {
					content: '';
					clear: both;
					display: table;
				}

				&.readOnly {
					pointer-events: none;
					border: none;
					background: none;
					width: 100%;
					margin: 0;
				}

				${options.styles ? options.styles(theme) : ''}
			`,
		});

		this.tagInput = tagInput;
		this.addButton = addButton;
		this.addTag = addTag;

		this.append([
			...(options.tags || []).map(textContent => new Tag({ readOnly: options.readOnly, textContent })),
			...(addTag ? [addTag] : []),
		]);
	}
}

export default TagList;
