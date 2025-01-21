import { Component } from '../../Component';
import { styled } from '../../styled';
import { Button } from '../Button';
import { Input } from '../Input';

import Tag from './Tag';

const StyledComponent = styled(
	Component,
	() => `
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
	`,
);

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

class TagList extends StyledComponent {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super({ ...options, tag: 'ul' }, ...children);
	}

	render() {
		super.render();

		if (!this.options.readOnly) {
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

					if (this.tagInput.elem.value.length === 0 || tags.includes(this.tagInput.elem.value)) return;

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
			...(this.options.tags || []).map(textContent => new Tag({ readOnly: this.options.readOnly, textContent })),
			...(this.addTag ? [this.addTag] : []),
		]);
	}
}

export default TagList;
