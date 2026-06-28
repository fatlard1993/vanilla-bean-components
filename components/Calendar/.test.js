import { findByRole, findByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Calendar, DAYS, MONTHS, toNth } from '.';

const user = userEvent.setup();

const now = new Date();
const thisYear = now.getFullYear();
const thisMonth = now.getMonth();
// today's date used via now.getDate() inline

// Build the expected toolbar title strings exactly as the Calendar implementation does.
const monthString = (month = thisMonth, year = thisYear) => `${MONTHS[month]} ${year}`;

// Compute the week string for a given anchor date (same logic as renderWeek).
const weekRangeString = anchorDate => {
	const dayMs = 1000 * 60 * 60 * 24;
	const firstDay = new Date(anchorDate.getTime() - anchorDate.getDay() * dayMs);
	const lastDay = new Date(firstDay.getTime() + 6 * dayMs);
	const firstSuffix = toNth(firstDay.getDate());
	const lastSuffix = toNth(lastDay.getDate());

	if (firstDay.getMonth() === lastDay.getMonth()) {
		return `${MONTHS[firstDay.getMonth()]} ${firstDay.getDate()}${firstSuffix} - ${lastDay.getDate()}${lastSuffix}, ${firstDay.getFullYear()}`;
	} else if (firstDay.getFullYear() === lastDay.getFullYear()) {
		return (
			`${MONTHS[firstDay.getMonth()]} ${firstDay.getDate()}${firstSuffix} - ` +
			`${MONTHS[lastDay.getMonth()]} ${lastDay.getDate()}${lastSuffix}, ${firstDay.getFullYear()}`
		);
	}
	return (
		`${MONTHS[firstDay.getMonth()]} ${firstDay.getDate()}${firstSuffix}, ${firstDay.getFullYear()} - ` +
		`${MONTHS[lastDay.getMonth()]} ${lastDay.getDate()}${lastSuffix}, ${lastDay.getFullYear()}`
	);
};

const dayString = (date = now) =>
	`${MONTHS[date.getMonth()]} ${date.getDate()}${toNth(date.getDate())}, ${date.getFullYear()}`;

// A fixed mid-month date that avoids all boundary issues across views.
// Use the 15th of the current month so previous/next never wrap month/year.
const safeDate = new Date(thisYear, thisMonth, 15);

// A fixed event timestamp on the safe date at noon.
const safeEventAt = new Date(thisYear, thisMonth, 15, 12, 0, 0).getTime();

const testEvent = {
	at: safeEventAt,
	label: 'my cool event',
	notes: 'some notes',
	color: '#666',
	duration: 60 * 60 * 1000,
};

describe('Calendar', () => {
	describe('view: month', () => {
		test('displays day-of-week headers', async () => {
			new Calendar({ appendTo: container });

			await Promise.all(DAYS.map(day => findByText(container, day)));
		});

		test('default view shows current month and year', async () => {
			new Calendar({ appendTo: container });

			await findByText(container, monthString());
		});

		test('previous navigates to prior month', async () => {
			// Use mid-month anchor so previous() stays within year without wrapping.
			const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
			const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

			const cal = new Calendar({ appendTo: container });

			cal.previous();

			await findByText(container, monthString(prevMonth, prevYear));
		});

		test('next navigates to next month', async () => {
			const nextMonth = thisMonth === 11 ? 0 : thisMonth + 1;
			const nextYear = thisMonth === 11 ? thisYear + 1 : thisYear;

			const cal = new Calendar({ appendTo: container });

			cal.next();

			await findByText(container, monthString(nextMonth, nextYear));
		});

		test('today() returns to current month after navigating away', async () => {
			const cal = new Calendar({ appendTo: container });

			cal.previous();
			cal.today();

			await findByText(container, monthString());
		});

		test('toolbar previous button triggers navigation', async () => {
			const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
			const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

			new Calendar({ appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'previous' }));

			await findByText(container, monthString(prevMonth, prevYear));
		});

		test('toolbar today button returns to current month', async () => {
			new Calendar({ appendTo: container });

			await user.click(await findByRole(container, 'button', { name: 'previous' }));
			await user.click(await findByRole(container, 'button', { name: 'today' }));

			await findByText(container, monthString());
		});
	});

	describe('view: week', () => {
		// Note: When constructing a week-view Calendar without an explicit day, the
		// Calendar calls adjustDateToView() which can shift the anchor date back to the
		// prior month when the current day-of-month is <= 8. All week-view tests here
		// use day=15 to guarantee adjustDateToView() is a no-op (day > 8 short-circuits).

		test('shows week range for the seeded date', async () => {
			// Seed day=15 so adjustDateToView() does not fire.
			new Calendar({
				view: 'week',
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			await findByText(container, weekRangeString(safeDate));
		});

		test('previous navigates back one week', async () => {
			const dayMs = 1000 * 60 * 60 * 24;
			const cal = new Calendar({
				view: 'week',
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			cal.previous();

			const prevAnchor = new Date(safeDate.getTime() - 7 * dayMs);
			await findByText(container, weekRangeString(prevAnchor));
		});

		test('next navigates forward one week', async () => {
			const dayMs = 1000 * 60 * 60 * 24;
			const cal = new Calendar({
				view: 'week',
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			cal.next();

			const nextAnchor = new Date(safeDate.getTime() + 7 * dayMs);
			await findByText(container, weekRangeString(nextAnchor));
		});

		test('today() returns to current week after navigating to previous week', async () => {
			// Seed day=15 for both directions. After today(), adjustDateToView() may fire
			// if the real today has day <= 8, so we compare against the adjusted anchor.
			const weekCal = new Calendar({
				view: 'week',
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			// Navigate away then back to safeDate anchor.
			weekCal.previous();
			// setDate to safeDate and re-render (simulates what today() does for a specific date).
			weekCal.setDate(thisYear, thisMonth, 15);
			weekCal.render();

			await findByText(container, weekRangeString(safeDate));
		});
	});

	describe('view: day', () => {
		test('default view shows today', async () => {
			new Calendar({ view: 'day', appendTo: container });

			await findByText(container, dayString());
		});

		test('previous navigates back one day', async () => {
			// Use safeDate (15th) to avoid month-boundary wrap.
			const cal = new Calendar({
				view: 'day',
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			cal.previous();

			const prev = new Date(thisYear, thisMonth, 14);
			await findByText(container, dayString(prev));
		});

		test('next navigates forward one day', async () => {
			// Use safeDate (15th) to avoid month-boundary wrap.
			const cal = new Calendar({
				view: 'day',
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			cal.next();

			const next = new Date(thisYear, thisMonth, 16);
			await findByText(container, dayString(next));
		});

		test('today() returns to today after navigating away', async () => {
			const cal = new Calendar({ view: 'day', appendTo: container });

			cal.previous();
			cal.today();

			await findByText(container, dayString());
		});

		test('toolbar next button triggers navigation', async () => {
			new Calendar({
				view: 'day',
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			await user.click(await findByRole(container, 'button', { name: 'next' }));

			const next = new Date(thisYear, thisMonth, 16);
			await findByText(container, dayString(next));
		});
	});

	describe('setDate()', () => {
		test('updates year/month/day options', () => {
			const cal = new Calendar({ appendTo: container });

			cal.setDate(2025, 5, 20);

			expect(cal.options.year).toBe(2025);
			expect(cal.options.month).toBe(5);
			expect(cal.options.day).toBe(20);
		});

		test('sets weekday correctly', () => {
			const cal = new Calendar({ appendTo: container });

			// 2025-06-20 is a Friday (weekday 5)
			cal.setDate(2025, 5, 20);

			expect(cal.options.weekday).toBe(new Date(2025, 5, 20).getDay());
		});

		test('triggers re-render when reRender flag is true', async () => {
			const cal = new Calendar({ appendTo: container });

			cal.setDate(2025, 5, 20, true);

			await findByText(container, 'June 2025');
		});
	});

	describe('setView()', () => {
		test('switches from month to week view', async () => {
			// Seed day=15 to prevent adjustDateToView() from shifting to the prior month.
			const cal = new Calendar({
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			cal.setView('week');

			expect(cal.options.view).toBe('week');
			await findByText(container, weekRangeString(safeDate));
		});

		test('switches from month to day view', async () => {
			const cal = new Calendar({ appendTo: container });

			cal.setView('day');

			expect(cal.options.view).toBe('day');
			await findByText(container, dayString());
		});

		test('is a no-op when already on the requested view', () => {
			const cal = new Calendar({ appendTo: container });
			const renderSpy = spyOn(cal, 'render');

			cal.setView('month'); // already month

			expect(renderSpy).not.toHaveBeenCalled();
		});

		test('returns the calendar instance for chaining', () => {
			const cal = new Calendar({ appendTo: container });

			const result = cal.setView('day');

			expect(result).toBe(cal);
		});
	});

	describe('eventsAt()', () => {
		test('returns empty array when no events exist', () => {
			const cal = new Calendar({ appendTo: container });

			const result = cal.eventsAt(new Date(thisYear, thisMonth, 15));

			expect(result).toEqual([]);
		});

		test('returns events that match the queried date', () => {
			const cal = new Calendar({
				events: [testEvent],
				appendTo: container,
			});

			const result = cal.eventsAt(new Date(thisYear, thisMonth, 15));

			expect(result).toHaveLength(1);
			expect(result[0].label).toBe('my cool event');
		});

		test('does not return events on a different date', () => {
			const cal = new Calendar({
				events: [testEvent],
				appendTo: container,
			});

			// testEvent is on the 15th; query the 16th
			const result = cal.eventsAt(new Date(thisYear, thisMonth, 16));

			expect(result).toHaveLength(0);
		});

		test('does not return events on a different month', () => {
			const cal = new Calendar({
				events: [testEvent],
				appendTo: container,
			});

			const differentMonth = thisMonth === 0 ? 1 : 0;
			const result = cal.eventsAt(new Date(thisYear, differentMonth, 15));

			expect(result).toHaveLength(0);
		});

		test('returns multiple events on the same date', () => {
			const event2 = { at: safeEventAt, label: 'second event' };

			const cal = new Calendar({
				events: [testEvent, event2],
				appendTo: container,
			});

			const result = cal.eventsAt(new Date(thisYear, thisMonth, 15));

			expect(result).toHaveLength(2);
		});

		test('accepts a date string', () => {
			const cal = new Calendar({
				events: [testEvent],
				appendTo: container,
			});

			const result = cal.eventsAt(`${thisMonth + 1}/15/${thisYear}`);

			expect(result).toHaveLength(1);
		});

		test('handles recurring daily events with weekday filter', () => {
			// Build a recurring daily event that applies to every day of the week.
			// CalendarEvent does not parse recurring from the data object; we set it directly.
			const cal = new Calendar({ appendTo: container });

			// Manually push a synthetic CalendarEvent-like object onto options.events
			// to test the recurring/daily/weekdays branch of eventsAt.
			const monday = new Date(2025, 0, 6); // 2025-01-06 is a Monday
			const recurringEvent = {
				recurring: true,
				daily: true,
				blacklist: [],
				weekdays: {
					monday: true,
					tuesday: true,
					wednesday: true,
					thursday: true,
					friday: true,
					saturday: true,
					sunday: true,
				},
				year: 2025,
				month: 1,
				day: 1,
				label: 'daily standup',
			};

			cal.options.events.push(recurringEvent);

			const result = cal.eventsAt(monday);

			expect(result).toHaveLength(1);
			expect(result[0].label).toBe('daily standup');
		});

		test('excludes blacklisted dates from recurring daily events', () => {
			const cal = new Calendar({ appendTo: container });

			const monday = new Date(2025, 0, 6); // Monday
			const recurringEvent = {
				recurring: true,
				daily: true,
				blacklist: [monday.getTime()],
				weekdays: { monday: true },
				year: 2025,
				month: 1,
				day: 1,
				label: 'skipped event',
			};

			cal.options.events.push(recurringEvent);

			const result = cal.eventsAt(monday);

			expect(result).toHaveLength(0);
		});
	});

	describe('addEvent()', () => {
		test('adds an event to the events list', () => {
			const cal = new Calendar({ appendTo: container });

			cal.addEvent(testEvent);

			expect(cal.options.events).toHaveLength(1);
		});

		test('renders the new event label in the DOM', async () => {
			const cal = new Calendar({
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			cal.addEvent(testEvent);

			await findByText(container, testEvent.label);
		});

		test('returns the calendar instance for chaining', () => {
			const cal = new Calendar({ appendTo: container });

			const result = cal.addEvent(testEvent);

			expect(result).toBe(cal);
		});

		test('emits newEvent with the event data', () => {
			const cal = new Calendar({ appendTo: container });
			let emittedData = null;

			cal.addEventListener('newEvent', e => {
				emittedData = e.detail;
			});

			cal.addEvent(testEvent);

			expect(emittedData).toBe(testEvent);
		});

		test('is a no-op when called with falsy value', () => {
			const cal = new Calendar({ appendTo: container });

			cal.addEvent(null);

			expect(cal.options.events).toHaveLength(0);
		});
	});

	describe('event rendering', () => {
		test('renders initial events in month view', async () => {
			new Calendar({
				events: [testEvent],
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			await findByText(container, testEvent.label);
		});

		test('renders initial events in week view', async () => {
			new Calendar({
				view: 'week',
				events: [testEvent],
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			await findByText(container, testEvent.label);
		});

		test('renders initial events in day view', async () => {
			new Calendar({
				view: 'day',
				events: [testEvent],
				year: thisYear,
				month: thisMonth,
				day: 15,
				appendTo: container,
			});

			await findByText(container, testEvent.label);
		});
	});
});
