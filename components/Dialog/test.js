import { findByText, findByRole } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { DomElem } from '..';
import Dialog from '.';

const container = new JSDOM().window.document.body;

describe('Dialog', () => {
	test('must must support a string header', async () => {
		const header = 'header';

		new Dialog({ header, appendTo: container });

		await findByText(container, header);
	});

	test('must must support a string content', async () => {
		const content = 'content';

		new Dialog({ content, appendTo: container });

		await findByText(container, content);
	});

	test('must must support an element header', async () => {
		const header = new DomElem({ tag: 'p', textContent: 'header' });

		new Dialog({ header, appendTo: container });

		await findByText(container, 'header');
	});

	test('must must support an element content', async () => {
		const content = new DomElem({ tag: 'p', textContent: 'content' });

		new Dialog({ content, appendTo: container });

		await findByText(container, 'content');
	});

	test('must must support an element footer', async () => {
		const footer = new DomElem({ tag: 'p', textContent: 'footer' });

		new Dialog({ footer, appendTo: container });

		await findByText(container, 'footer');
	});

	test('must must support footer buttons', async () => {
		new Dialog({ buttons: ['button1', 'button2'], appendTo: container });

		await findByRole(container, 'button', { name: 'button1' });
		await findByRole(container, 'button', { name: 'button2' });
	});
});
