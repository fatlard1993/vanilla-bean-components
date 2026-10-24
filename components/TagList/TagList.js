import { Component } from '../../Component';
import { styled } from '../../styled';
import { Button } from '../Button';
import { Input } from '../Input';
import { showFieldError } from '../Input/fieldError';

import Tag from './Tag';

const StyledComponent = styled(
	Component,
	({ space }) => `
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: ${space.xs};
		list-style: none;
		margin: 0;
		padding: ${space.xs};
		box-sizing: border-box;

		&.readOnly {
			pointer-events: none;
			padding: 0;
		}
	`,
);

const TagListInput = styled(
	Input,
	() => `
		flex: 1;
		min-width: 80px;
	`,
);

/**
 * Interactive tag list component with add/remove functionality and input support.
 *
 * Displays a collection of tags with optional editing capabilities including
 * inline text input for adding new tags and removal buttons for existing tags.
 * @param {object} [options={}] - TagList configuration options
 * @param {string} [options.tag='ul'] - HTML tag for the container element
 * @param {boolean} [options.readOnly=false] - Whether tags can be added/removed
 * @param {Function} [options.accept] - (value, tagList) => the tag to add (true keeps it as typed), or false to refuse it
 * @param {Array<string>} [options.suggestions] - Values offered while typing a new tag
 * @param {Array<string>} [options.tags] - Initial array of tag text values
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {TagList} TagList component instance
 */
class TagList extends StyledComponent {
	static schema = {
		tag: { default: 'ul' },
		readOnly: {
			default: false,
			set(value) {
				this.toggleClass('readOnly', !!value);
			},
		},
		tags: {
			get default() {
				return [];
			},
		},
		// (value, tagList) => the tag to add (true keeps it as typed), or false to refuse it
		accept: {},
		suggestions: {
			set(value) {
				if (this.tagInput) this.tagInput.options.suggestions = value;
			},
		},
	};

	_addTag(value) {
		value = (value || '').trim();
		if (!value) return;

		if (this.options.accept) {
			const accepted = this.options.accept(value, this);

			if (!accepted) {
				this._refuse(value);
				return;
			}

			if (accepted !== true) value = String(accepted);
		}

		const existing = Array.from(this.elem.querySelectorAll('li[data-value]')).map(el => el.dataset.value);
		if (existing.includes(value)) return;

		this.elem.insertBefore(new Tag({ textContent: value }).elem, this.addTag.elem);
		this.tagInput.elem.value = '';
		this.tagInput.elem.focus();
	}

	// A refused entry is said so, as any field's error is, and left selected, ready to be corrected; typing clears it
	_refuse(value) {
		showFieldError({ owner: this, field: this.tagInput.elem, messages: [`Can't add "${value}"`] });
		this.tagInput.elem.select();
	}

	build() {
		if (!this.options.readOnly) {
			this.tagInput = new TagListInput({ placeholder: 'New Tag' });

			this.tagInput.on({
				targetEvent: 'keyup',
				callback: e => {
					if (e.key === 'Enter') this._addTag(this.tagInput.elem.value);
				},
			});

			this.tagInput.on({
				targetEvent: 'input',
				id: 'clearRefusal',
				callback: () => {
					if (this._fieldError) showFieldError({ owner: this, field: this.tagInput.elem });
				},
			});

			// Enter belongs to this field: claimed, so a dialog or form around it doesn't also act on it
			this.tagInput.on({
				targetEvent: 'keydown',
				id: 'claimEnter',
				callback: e => {
					if (e.key === 'Enter') e.preventDefault();
				},
			});

			this.addTag = new Tag(
				{ readOnly: true, addClass: 'add-tag' },
				this.tagInput,
				new Button({
					icon: 'plus',
					onPointerPress: () => this._addTag(this.tagInput.elem.value),
				}),
			);

			this.replaceCleanup('tagListChildren', () => {
				this.addTag?.destroy?.();
			});
		}

		this.append([
			...this.options.tags.map(textContent => new Tag({ readOnly: this.options.readOnly, textContent })),
			...(this.addTag ? [this.addTag] : []),
		]);
	}
}

export default TagList;
