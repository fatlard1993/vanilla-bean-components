import { styled } from '../../utils';
import { DomElem } from '../DomElem';
import { Input } from '../Input';
import { Button } from '../Button';

import Tag from './Tag';

const TagListTextInput = styled(
	Input,
	() => `
		display: inline-block;
		flex: 1;
		margin: 3px;
	`,
);

const TagListIconButton = styled(
	Button,
	() => `
		margin: 3px 0 3px 3px;
	`,
);

const defaultOptions = { readOnly: false };

class TagList extends DomElem {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...options,
				tag: 'ul',
				styles: (theme, domElem) => `
					margin: 1% auto;
					border-radius: 3px;
					box-sizing: border-box;
					min-height: 1em;
					padding: 0;

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

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);
	}

	render(options = this.options) {
		super.render(options);

		if (!options.readOnly) {
			this.tagInput = new TagListTextInput({
				placeholder: 'New Tag',
				onKeyUp: () => {
					this.addTag.elem.style.width = `${Math.max(
						260,
						this.tagInput.elem.value.length *
							Math.round(Number.parseInt(window.getComputedStyle(this.tagInput.elem).fontSize) * 0.75),
					)}px`;
				},
			});

			this.addButton = new TagListIconButton({
				icon: 'plus',
				onPointerPress: () => {
					const tags = Array.from(this.elem.children).map(elem => elem.textContent);

					if (this.tagInput.elem.value.length < 2 || tags.includes(this.tagInput.elem.value)) return;

					const newTag = new Tag({ textContent: this.tagInput.elem.value });

					this.elem.insertBefore(newTag.elem, this.addTag.elem);

					this.tagInput.elem.value = '';

					this.tagInput.elem.focus();
				},
			});

			this.addTag = new Tag({
				readOnly: true,
				addClass: 'addTag',
				append: [this.tagInput, this.addButton],
			});
		}

		this.append([
			...(options.tags || []).map(textContent => new Tag({ readOnly: options.readOnly, textContent })),
			...(this.addTag ? [this.addTag] : []),
		]);
	}
}

export default TagList;
