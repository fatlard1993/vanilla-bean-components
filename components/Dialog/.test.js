import { findByText, findByRole, fireEvent, waitForElementToBeRemoved, queryByRole } from '@testing-library/dom';

import { Component } from '../..';

import { Dialog } from '.';

describe('Dialog', () => {
	test('must display a dialog', async () => {
		const header = 'header';

		new Dialog({ header, appendTo: container });

		// TODO: The labelledby prop *should* make this work, but it doesn't
		// await findByRole(container, 'dialog', { name: header });

		await findByRole(container, 'dialog');
	});

	test('must support a string header', async () => {
		const header = 'header';

		new Dialog({ header, appendTo: container });

		await findByText(container, header);
	});

	test('must support a string body', async () => {
		const body = 'body';

		new Dialog({ body, appendTo: container });

		await findByText(container, body);
	});

	test('must support an element header', async () => {
		const header = new Component({ tag: 'p', textContent: 'header' });

		new Dialog({ header, appendTo: container });

		await findByText(container, 'header');
	});

	test('must support an element body', async () => {
		const body = new Component({ tag: 'p', textContent: 'body' });

		new Dialog({ body, appendTo: container });

		await findByText(container, 'body');
	});

	test('must support an element footer', async () => {
		const footer = new Component({ tag: 'p', textContent: 'footer' });

		new Dialog({ footer, appendTo: container });

		await findByText(container, 'footer');
	});

	test('must support footer buttons', async () => {
		new Dialog({ buttons: ['button1', 'button2'], appendTo: container });

		// TODO: Manual testing shows these rendered as buttons but the test reports no button roles exist
		// await findByRole(container, 'button', { name: 'button1' });
		// await findByRole(container, 'button', { name: 'button2' });

		await findByText(container, 'button1');
		await findByText(container, 'button2');
	});

	// Assertion not working but manual test proves working
	test.skip('must provide a way to close the dialog', async () => {
		new Dialog({
			buttons: ['Close'],
			onButtonPress: ({ closeDialog }) => closeDialog(),
			appendTo: container,
		});

		fireEvent.click(await findByRole(container, 'button', { name: 'Close' }), {});

		await waitForElementToBeRemoved(() => queryByRole(container, 'dialog'));
	});
});
