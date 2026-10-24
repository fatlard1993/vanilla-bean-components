import { failureReason } from '@vanilla-bean/hypertether';

import { Component } from '../../Component';
import { Elem } from '../../Elem';
import { styled } from '../../styled';
import { conditionalList } from '../../utils';
import { Dialog } from '../Dialog';
import { Form } from '../Form';

// A button is known by its data-action (save, delete, cancel), never by its label, which an app renames or translates
const actionOf = button => (typeof button === 'object' ? button?.['data-action'] : undefined);

// A request that came back failed, rather than threw: a hypertether result marked error, or a fetch Response not ok
const failedRequest = result =>
	result?.status === 'error' || result?.response?.ok === false || (result instanceof Response && !result.ok);

const reasonOf = result => {
	const status = result instanceof Response ? result.status : result?.response?.status;

	return failureReason(result) || (status ? `HTTP ${status}` : 'The request failed');
};

/**
 * A Dialog holding a Form, with Save, Delete (when there is something to delete) and Cancel.
 *
 * Save checks the form, then hands its data to onSave and closes once that settles; onSave returning false, returning
 * a failed request (a hypertether result with status 'error', or a Response that isn't ok), or throwing, keeps the
 * dialog open with the data as typed, and a failed request's reason or the error's message shows above the buttons
 * until the next try. Delete asks first when confirmDelete is set. Enter in a
 * single-line field saves. Any other button reaches onButtonPress as it would on a Dialog.
 *
 * The buttons are known by a `data-action` of `save`, `delete` or `cancel`, not by their labels: a dialog that lists its
 * own `buttons` marks the ones FormDialog should act on, `{ textContent: 'Save', 'data-action': 'save' }`.
 * @param {object} [options] - FormDialog configuration
 * @param {Array<object>} [options.inputs] - Form field definitions, as Form takes them
 * @param {object} [options.data] - Initial values, as Form takes them
 * @param {string|Component|Array} [options.intro] - Content shown above the form
 * @param {object} [options.formOptions] - Further options for the Form
 * @param {Function} [options.FormComponent] - The Form class to build, for a form with fields and behaviour of its own
 * @param {Function} [options.onSave] - Called with (data, dialog) when the form is valid; false, a failed request or a throw keeps it open
 * @param {Function} [options.onDelete] - Called with (data, dialog); its presence adds the Delete button
 * @param {string|object|boolean} [options.confirmDelete] - Ask before deleting: a message, or Dialog.confirm options
 * @param {string} [options.saveLabel] - Label of the save button
 * @param {string} [options.deleteLabel] - Label of the delete button
 * @param {string} [options.cancelLabel] - Label of the cancel button
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {FormDialog} FormDialog component instance
 * @example
 * new FormDialog({
 *   header: 'Edit category',
 *   inputs: [{ key: 'name', validate: value => (value ? null : 'Required') }],
 *   data: category,
 *   onSave: data => updateCategory(category.id, data),
 *   onDelete: () => deleteCategory(category.id),
 *   confirmDelete: `Delete "${category.name}"?`,
 * });
 */
class FormDialog extends styled(
	Dialog,
	({ colors, space }) => `
		& .failure {
			padding: 0 ${space.md} ${space.sm};
			color: ${colors.light(colors.danger)};
		}

		& .failure:empty {
			display: none;
		}
	`,
) {
	static schema = {
		size: { default: 'fit' },
		inputs: {},
		data: {},
		intro: {
			set(value) {
				this.intro?.content(value ?? '');
			},
		},
		formOptions: {},
		FormComponent: { default: Form },
		onSave: {},
		onDelete: {},
		confirmDelete: {},
		saveLabel: { default: 'Save' },
		deleteLabel: { default: 'Delete' },
		cancelLabel: { default: 'Cancel' },
	};

	static prepareOptions(options) {
		const { onButtonPress: ownButtonPress } = options;

		return {
			...options,
			buttons:
				options.buttons ??
				conditionalList([
					{ alwaysItem: { textContent: options.saveLabel, 'data-action': 'save' } },
					{ if: !!options.onDelete, thenItem: { textContent: options.deleteLabel, 'data-action': 'delete' } },
					{ alwaysItem: { textContent: options.cancelLabel, 'data-action': 'cancel' } },
				]),
			onButtonPress: press => press.dialog._press(press, ownButtonPress),
		};
	}

	build() {
		super.build();

		this.intro = new Component({ addClass: 'intro', appendTo: this.body });

		this.form = new this.options.FormComponent({
			inputs: this.options.inputs,
			data: this.options.data,
			...this.options.formOptions,
			appendTo: this.body,
		});

		// Next to the buttons it answers, below whatever else the dialog holds
		this.failure = new Elem({ addClass: 'failure', attributes: { role: 'alert' } });
		this._footer.elem.before(this.failure.elem);

		this.form.elem.addEventListener('keydown', event => {
			const { target } = event;
			const singleLine = target.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'submit'].includes(target.type);

			// A field that uses Enter itself (a tag list, an autocomplete) claims it with preventDefault
			if (event.key !== 'Enter' || !singleLine || event.isComposing || event.defaultPrevented) return;

			event.preventDefault();
			this.save();
		});
	}

	_press(press, ownButtonPress) {
		const action = actionOf(press.button);

		if (action === 'save') this.save();
		else if (action === 'delete' && this.options.onDelete) this.delete();
		else if (action === 'cancel') press.closeDialog();
		else ownButtonPress?.(press);
	}

	_setBusy(busy) {
		for (const button of this._footer?.elem.querySelectorAll('[data-action=save], [data-action=delete]') ?? []) {
			button.disabled = busy;
		}
	}

	async _settle(action) {
		this.busy = true;
		this._setBusy(true);
		this.failure.elem.textContent = '';

		try {
			const result = await action({ ...this.form.options.data }, this);

			if (result === false) return false;

			if (failedRequest(result)) {
				this.failure.elem.textContent = reasonOf(result);

				return false;
			}

			this.close();

			return true;
		} catch (error) {
			globalThis.reportError ? globalThis.reportError(error) : console.error(error); // eslint-disable-line no-console
			this.failure.elem.textContent = error?.message || String(error);

			return false;
		} finally {
			this.busy = false;
			this._setBusy(false);
		}
	}

	/**
	 * Checks the form and, when it's valid, saves it through onSave.
	 * @returns {Promise<boolean>} Whether it saved and closed
	 */
	async save() {
		if (this.busy) return false;

		this.failure.elem.textContent = '';

		if (this.form.hasErrors()) return false;

		return this._settle(this.options.onSave ?? (() => {}));
	}

	/**
	 * Deletes through onDelete, asking first when confirmDelete is set.
	 * @returns {Promise<boolean>} Whether it deleted and closed
	 */
	async delete() {
		if (this.busy || !this.options.onDelete) return false;

		const { confirmDelete } = this.options;

		if (confirmDelete) {
			const confirmed = await Dialog.confirm({
				intent: 'warning',
				header: 'Delete?',
				confirmLabel: this.options.deleteLabel,
				...(typeof confirmDelete === 'object' ? confirmDelete : { body: confirmDelete === true ? '' : confirmDelete }),
			});

			if (!confirmed) return false;
		}

		return this._settle(this.options.onDelete);
	}
}

export default FormDialog;
