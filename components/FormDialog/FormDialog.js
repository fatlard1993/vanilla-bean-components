import { conditionalList } from '../../utils';
import { Dialog } from '../Dialog';
import { Form } from '../Form';

const labelOf = button => (typeof button === 'object' ? button.textContent : button);

/**
 * A Dialog holding a Form, with Save, Delete (when there is something to delete) and Cancel.
 *
 * Save checks the form, then hands its data to onSave and closes once that settles; onSave returning false, or
 * throwing, keeps the dialog open with the data as typed. Delete asks first when confirmDelete is set. Enter in a
 * single-line field saves. Any other button reaches onButtonPress as it would on a Dialog.
 * @param {object} [options] - FormDialog configuration
 * @param {Array<object>} [options.inputs] - Form field definitions, as Form takes them
 * @param {object} [options.data] - Initial values, as Form takes them
 * @param {object} [options.formOptions] - Further options for the Form
 * @param {Function} [options.FormComponent] - The Form class to build, for a form with fields and behaviour of its own
 * @param {Function} [options.onSave] - Called with (data, dialog) when the form is valid; false or a throw keeps it open
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
 *   inputs: [{ key: 'name', validations: [[/.+/, 'Required']] }],
 *   data: category,
 *   onSave: data => updateCategory(category.id, data),
 *   onDelete: () => deleteCategory(category.id),
 *   confirmDelete: `Delete "${category.name}"?`,
 * });
 */
class FormDialog extends Dialog {
	static schema = {
		size: { default: 'fit' },
		inputs: {},
		data: {},
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
					{ alwaysItem: options.saveLabel },
					{ if: !!options.onDelete, thenItem: options.deleteLabel },
					{ alwaysItem: options.cancelLabel },
				]),
			onButtonPress: press => press.dialog._press(press, ownButtonPress),
		};
	}

	build() {
		super.build();

		this.form = new this.options.FormComponent({
			inputs: this.options.inputs,
			data: this.options.data,
			...this.options.formOptions,
			appendTo: this.body,
		});

		this.form.elem.addEventListener('keydown', event => {
			const { target } = event;
			const singleLine = target.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'submit'].includes(target.type);

			if (event.key !== 'Enter' || !singleLine || event.isComposing) return;

			event.preventDefault();
			this.save();
		});
	}

	_press(press, ownButtonPress) {
		const label = labelOf(press.button);

		if (label === this.options.saveLabel) this.save();
		else if (label === this.options.deleteLabel && this.options.onDelete) this.delete();
		else if (label === this.options.cancelLabel) press.closeDialog();
		else ownButtonPress?.(press);
	}

	_setBusy(busy) {
		for (const button of this._footer?.elem.querySelectorAll('button') ?? []) {
			if ([this.options.saveLabel, this.options.deleteLabel].includes(button.textContent)) button.disabled = busy;
		}
	}

	async _settle(action) {
		this.busy = true;
		this._setBusy(true);

		try {
			if ((await action({ ...this.form.options.data }, this)) === false) return false;

			this.close();

			return true;
		} catch (error) {
			globalThis.reportError ? globalThis.reportError(error) : console.error(error); // eslint-disable-line no-console

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
		if (this.busy || this.form.hasErrors()) return false;

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
				variant: 'warning',
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
