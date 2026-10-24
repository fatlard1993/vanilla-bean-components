import { Component } from '../../Component';
import { styled } from '../../styled';
import { Button } from '../Button';
import { Input } from '../Input';
import { runValidators, showFieldError } from '../Input/fieldError';

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
 * inline text input for adding new tags and removal buttons for existing tags. Its value is the list of tags, so it
 * works as a Form field (`InputComponent: TagList`) like any other.
 * @param {object} [options={}] - TagList configuration options
 * @param {string} [options.tag='ul'] - HTML tag for the container element
 * @param {Array<string>} [options.value] - The tags; follows every one added or removed
 * @param {Function} [options.onChange] - Hears `change` when a tag is added or removed; `event.value` is the new list
 * @param {boolean} [options.readOnly=false] - Whether tags can be added/removed
 * @param {Function} [options.accept] - (value, tagList) => the tag to add (true keeps it as typed), or false to refuse it
 * @param {Function|Array<Function>} [options.validate] - `tags => message`: what's wrong with the list, or nothing; or a
 *   list of them. Checked as it changes and by validate(), the message shown below it
 * @param {Array<string>} [options.suggestions] - Values offered while typing a new tag
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {TagList} TagList component instance
 * @example new TagList({ value: ['co-op', 'party'], onChange: ({ value }) => save({ tags: value }) })
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
		value: {
			get default() {
				return [];
			},
			set(value) {
				this._showTags(value ?? []);

				if (this.rendered && this.options.validate) this.validate();
			},
		},
		// (value, tagList) => the tag to add (true keeps it as typed), or false to refuse it
		accept: {},
		// Read by validate(); data, as validate() is also the method that runs it
		validate: { data: true },
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

		this.tagInput.elem.value = '';
		this.tagInput.elem.focus();

		if (this.options.value.includes(value)) return;

		this._change([...this.options.value, value]);
	}

	_removeTag(value) {
		this._change(this.options.value.filter(tag => tag !== value));
		this.tagInput?.elem.focus();
	}

	// A change made here, by adding or removing a tag, is announced; a value set from outside is not
	_change(value) {
		this.options.value = value;
		this.emit('change', { value: [...value] });
	}

	// The tags shown follow the value: kept where they still are, added before the new-tag field, removed when gone
	_showTags(value) {
		const shown = new Map(
			Array.from(this.elem.querySelectorAll(':scope > li[data-value]'), elem => [elem.dataset.value, elem]),
		);

		for (const [text, elem] of shown) if (!value.includes(text)) elem._component?.destroy() ?? elem.remove();

		for (const text of value) {
			const elem =
				shown.get(text) ??
				new Tag({
					readOnly: this.options.readOnly,
					textContent: text,
					onRemove: () => this._removeTag(text),
				}).elem;

			if (this.addTag?.elem.parentElement === this.elem) this.elem.insertBefore(elem, this.addTag.elem);
			else this.elem.append(elem);
		}
	}

	// A refused entry is said so, as any field's error is, and left selected, ready to be corrected; typing clears it
	_refuse(value) {
		this._refused = true;
		showFieldError({ owner: this, field: this.tagInput.elem, messages: [`Can't add "${value}"`] });
		this.tagInput.elem.select();
	}

	/**
	 * Checks the tags against the `validate` option, showing what's wrong below the list (or clearing it), and marking the
	 * new-tag field invalid for assistive technology.
	 * @returns {Array<string>|undefined} What's wrong, or undefined when nothing is
	 */
	validate() {
		const errors = runValidators(this.options.validate, this.options.value);

		this._refused = false;
		showFieldError({ owner: this, field: this.tagInput?.elem, messages: errors });

		return errors.length ? errors : undefined;
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
					if (this._refused) this.validate();
				},
			});

			// The field's own change is a word being typed, not the list changing: it stops here
			this.tagInput.on({ targetEvent: 'change', id: 'keepChange', callback: event => event.stopPropagation() });

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

			this.append(this.addTag);
		}
	}
}

export default TagList;
