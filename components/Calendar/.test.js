import { findByRole, findByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Calendar, DAYS, MONTHS, toNth } from '.';

const user = userEvent.setup();

const now = new Date();
const thisYear = now.getFullYear();
const thisMonth = now.getMonth();
const today = now.getDate();

const monthString = (month = thisMonth, year = thisYear) => `${MONTHS[month]} ${year}`;
const weekString = (day = today, month = thisMonth, year = thisYear) => {
	const targetDate = new Date(`${month + 1}/${day}/${year}`);
	const targetWeekday = DAYS[targetDate.getDay()];
	return `${targetWeekday}, ${MONTHS[month]} ${day}${toNth(day)}`;
};
const dayString = (day = today, month = thisMonth, year = thisYear) => `${MONTHS[month]} ${day}${toNth(day)}, ${year}`;

const testEvent = {
	at: Date.now(),
	label: 'my cool event',
	notes: 'some notes',
	color: '#666',
	duration: 60 * 60 * 1000,
};

describe('Calendar', () => {
	describe('view: month', () => {
		test('displays all days', async () => {
			new Calendar({ appendTo: container });

			await Promise.allSettled(DAYS.map(day => findByText(container, day)));
		});

		test('default view: today', async () => {
			new Calendar({ appendTo: container });

			await findByText(container, monthString());
		});

		test('previous', async () => {
			new Calendar({ appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'previous' }));

			await findByText(container, monthString(thisMonth - 1));
		});

		test('today', async () => {
			new Calendar({ appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'previous' }));

			await findByText(container, monthString(thisMonth - 1));

			await user.click(await findByRole(container, 'button', { name: 'today' }));

			await findByText(container, monthString());
		});

		test('next', async () => {
			new Calendar({ appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'next' }));

			await findByText(container, monthString(thisMonth + 1));
		});
	});

	describe('view: week', () => {
		test('displays all days', async () => {
			new Calendar({ appendTo: container });

			await Promise.allSettled(DAYS.map(day => findByText(container, day)));
		});

		test('default view: today', async () => {
			new Calendar({ view: 'week', appendTo: container });

			await findByText(container, weekString());
		});

		test('previous', async () => {
			new Calendar({ view: 'week', appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'previous' }));

			await findByText(container, weekString(today - 7));
		});

		test('today', async () => {
			new Calendar({ view: 'week', appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'previous' }));

			await findByText(container, weekString(today - 7));

			await user.click(await findByRole(container, 'button', { name: 'today' }));

			await findByText(container, weekString());
		});

		test.skip('next', async () => {
			new Calendar({ view: 'week', appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'next' }));

			await findByText(container, weekString(today + 7));
		});
	});

	describe('view: day', () => {
		test('default view: today', async () => {
			new Calendar({ view: 'day', appendTo: container });

			await findByText(container, dayString());
		});

		test('previous', async () => {
			new Calendar({ view: 'day', appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'previous' }));

			await findByText(container, dayString(today - 1));
		});

		test('today', async () => {
			new Calendar({ view: 'day', appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'previous' }));

			await findByText(container, dayString(today - 1));

			await user.click(await findByRole(container, 'button', { name: 'today' }));

			await findByText(container, dayString());
		});

		test('next', async () => {
			new Calendar({ view: 'day', appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'next' }));

			await findByText(container, dayString(today + 1));
		});
	});

	test('must render events', async () => {
		new Calendar({
			events: [testEvent],
			appendTo: container,
		});

		await findByText(container, testEvent.label);
	});

	test('addEvent', async () => {
		const calendar = new Calendar({ appendTo: container });

		calendar.addEvent(testEvent);

		await findByText(container, testEvent.label);
	});
});
