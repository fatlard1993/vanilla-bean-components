import { findByText, getAllByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Form } from '../Form';
import { FormDialog } from '.';

const settle = () => new Promise(resolve => setTimeout(resolve, 30));
const labels = () => getAllByRole(document.body, 'button', { hidden: true }).map(button => button.textContent);
const press = async label => userEvent.setup().click(await findByText(document.body, label));

const nameField = { key: 'name', validate: value => (value ? null : 'Required') };

describe('FormDialog', () => {
	test('holds a form built from inputs and data, with Save and Cancel', async () => {
		const dialog = new FormDialog({ inputs: [nameField], data: { name: 'Garden' } });

		await settle();

		expect(dialog.form.inputElements.name.elem.value).toBe('Garden');
		expect(labels()).toEqual(['Save', 'Cancel']);
	});

	test('onDelete adds Delete between them', async () => {
		new FormDialog({ inputs: [nameField], data: { name: 'Garden' }, onDelete: () => {} });

		await settle();

		expect(labels()).toEqual(['Save', 'Delete', 'Cancel']);
	});

	test('an invalid form does not save', async () => {
		const onSave = mock();
		const dialog = new FormDialog({ inputs: [nameField], data: { name: '' }, onSave });

		await press('Save');
		await settle();

		expect(onSave).not.toHaveBeenCalled();
		expect(dialog.elem.isConnected).toBe(true);
	});

	test('a valid form hands its data to onSave, then closes', async () => {
		const onSave = mock();
		const dialog = new FormDialog({ inputs: [nameField], data: { name: 'Garden' }, onSave });

		await settle();
		await userEvent.setup().clear(dialog.form.inputElements.name.elem);
		await userEvent.setup().type(dialog.form.inputElements.name.elem, 'Orchard');
		await press('Save');
		await settle();

		expect(onSave.mock.calls[0][0]).toEqual({ name: 'Orchard' });
		expect(onSave.mock.calls[0][1]).toBe(dialog);
		expect(dialog.elem.isConnected).toBe(false);
	});

	test('onSave returning false, or throwing, keeps the dialog open', async () => {
		const report = spyOn(globalThis, 'reportError').mockImplementation(() => {});
		const refusing = new FormDialog({ inputs: [nameField], data: { name: 'a' }, onSave: () => false });

		expect(await refusing.save()).toBe(false);
		expect(refusing.elem.isConnected).toBe(true);

		const failing = new FormDialog({
			inputs: [nameField],
			data: { name: 'b' },
			onSave: () => {
				throw new Error('offline');
			},
		});

		expect(await failing.save()).toBe(false);
		expect(failing.elem.isConnected).toBe(true);
		expect(report.mock.calls[0][0].message).toBe('offline');
	});

	test('a failed request returned from onSave or onDelete keeps the dialog open', async () => {
		for (const failed of [
			{ status: 'error', response: { ok: false, status: 500 } },
			new Response('nope', { status: 500 }),
		]) {
			const dialog = new FormDialog({
				inputs: [nameField],
				data: { name: 'a' },
				onSave: () => failed,
				onDelete: () => failed,
			});

			expect(await dialog.save()).toBe(false);
			expect(await dialog.delete()).toBe(false);
			expect(dialog.elem.isConnected).toBe(true);
		}

		const saved = new FormDialog({
			inputs: [nameField],
			data: { name: 'a' },
			onSave: () => ({ status: 'success', response: { ok: true } }),
		});

		expect(await saved.save()).toBe(true);
	});

	test('a failed save shows why above the buttons, and the next try clears it', async () => {
		let result = { status: 'error', body: { error: 'Name taken' }, response: { ok: false, status: 409 } };
		const dialog = new FormDialog({ inputs: [nameField], data: { name: 'a' }, onSave: () => result });
		const failure = () => dialog.failure.elem;

		expect(failure().textContent).toBe('');

		await dialog.save();

		expect(failure().textContent).toBe('Name taken');
		expect(failure()).toHaveAttribute('role', 'alert');

		let finish;
		result = new Promise(resolve => (finish = resolve));
		const retry = dialog.save();

		expect(failure().textContent).toBe('');

		finish({ status: 'error', body: 'Server down', response: { ok: false, status: 503 } });
		await retry;

		expect(failure().textContent).toBe('Server down');
	});

	test('a thrown error shows its message; a Response not ok shows its status', async () => {
		spyOn(globalThis, 'reportError').mockImplementation(() => {});
		const throwing = new FormDialog({
			inputs: [nameField],
			data: { name: 'a' },
			onSave: () => {
				throw new Error('offline');
			},
		});

		await throwing.save();

		expect(throwing.failure.elem.textContent).toBe('offline');

		const responding = new FormDialog({
			inputs: [nameField],
			data: { name: 'a' },
			onSave: () => new Response('', { status: 500 }),
		});

		await responding.save();

		expect(responding.failure.elem.textContent).toBe('HTTP 500');
	});

	test('onSave returning false shows nothing; the app said why itself', async () => {
		const dialog = new FormDialog({ inputs: [nameField], data: { name: 'a' }, onSave: () => false });

		await dialog.save();

		expect(dialog.failure.elem.textContent).toBe('');
	});

	test('Enter in a single-line field saves; Enter in a textarea is a new line', async () => {
		const onSave = mock();
		const dialog = new FormDialog({
			inputs: [nameField, { key: 'notes', tag: 'textarea' }],
			data: { name: 'Garden', notes: '' },
			onSave,
		});

		await settle();
		await userEvent.setup().type(dialog.form.inputElements.notes.elem, 'one{Enter}two');

		expect(onSave).not.toHaveBeenCalled();

		await userEvent.setup().type(dialog.form.inputElements.name.elem, '{Enter}');
		await settle();

		expect(onSave).toHaveBeenCalledTimes(1);
	});

	test('confirmDelete asks first; no keeps the form, yes deletes and closes', async () => {
		const onDelete = mock();
		const dialog = new FormDialog({
			inputs: [nameField],
			data: { name: 'Garden' },
			onDelete,
			confirmDelete: 'Really?',
		});

		// The confirm opens over the form dialog, so its buttons are the last of each label
		const pressInConfirm = async label =>
			userEvent.setup().click(
				getAllByRole(document.body, 'button', { hidden: true })
					.filter(b => b.textContent === label)
					.at(-1),
			);

		await press('Delete');
		await findByText(document.body, 'Really?');
		await settle(); // the confirm opens a moment after it renders
		await pressInConfirm('Cancel');
		await settle();

		expect(onDelete).not.toHaveBeenCalled();
		expect(dialog.elem.isConnected).toBe(true);

		dialog.delete();
		await findByText(document.body, 'Really?');
		await settle();
		await pressInConfirm('Delete');
		await settle();

		expect(onDelete).toHaveBeenCalledTimes(1);
		expect(dialog.elem.isConnected).toBe(false);
	});

	test('a button of its own reaches onButtonPress', async () => {
		const onButtonPress = mock();

		new FormDialog({ inputs: [nameField], data: { name: 'a' }, buttons: ['Save', 'Resolve', 'Cancel'], onButtonPress });

		await press('Resolve');

		expect(onButtonPress.mock.calls[0][0].button).toBe('Resolve');
	});

	test('Save is disabled while a save is under way', async () => {
		let finish;
		const dialog = new FormDialog({
			inputs: [nameField],
			data: { name: 'a' },
			onSave: () => new Promise(resolve => (finish = resolve)),
		});

		await settle();

		const saving = dialog.save();
		const save = getAllByRole(document.body, 'button', { hidden: true }).find(b => b.textContent === 'Save');

		expect(save).toBeDisabled();
		expect(await dialog.save()).toBe(false);

		finish();
		expect(await saving).toBe(true);
	});

	test('FormComponent builds a form of its own class', async () => {
		class TaggedForm extends Form {}

		const dialog = new FormDialog({ inputs: [nameField], data: { name: 'a' }, FormComponent: TaggedForm });

		expect(dialog.form).toBeInstanceOf(TaggedForm);
		expect(dialog.form.inputElements.name.elem.value).toBe('a');
	});

	test('intro shows above the form, and follows its option', async () => {
		const dialog = new FormDialog({ inputs: [nameField], intro: 'Fill this in', appendTo: container });

		expect(dialog.intro.elem).toHaveTextContent('Fill this in');
		expect(dialog.form.elem.compareDocumentPosition(dialog.intro.elem) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();

		dialog.options.intro = 'Updated';

		expect(dialog.intro.elem).toHaveTextContent('Updated');
	});

	test('Enter that a field claims for itself does not save', async () => {
		const onSave = mock();
		const dialog = new FormDialog({ inputs: [{ key: 'tags' }], data: { tags: '' }, onSave, appendTo: container });

		dialog.form.inputElements.tags.elem.addEventListener(
			'keydown',
			event => event.key === 'Enter' && event.preventDefault(),
		);
		await userEvent.setup().type(dialog.form.inputElements.tags.elem, 'a{Enter}');

		expect(onSave).not.toHaveBeenCalled();
	});
});
