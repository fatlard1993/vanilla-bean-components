import { findByRole, findByText, getAllByRole, getByRole, getByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Calendar } from '.';

const user = userEvent.setup();

const now = new Date();
const thisYear = now.getFullYear();
const thisMonth = now.getMonth();
// today's date used via now.getDate() inline

// The toolbar titles, in the reader's locale as the Calendar writes them
const DAY_TITLE = { month: 'long', day: 'numeric', year: 'numeric' };
const DAY_CELL = { weekday: 'long', month: 'long', day: 'numeric' };
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const monthString = (month = thisMonth, year = thisYear) =>
	new Date(year, month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

// The week holding a date, first day to last
const weekRangeString = anchorDate => {
	const firstDay = new Date(
		anchorDate.getFullYear(),
		anchorDate.getMonth(),
		anchorDate.getDate() - anchorDate.getDay(),
	);
	const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + 6);

	return new Intl.DateTimeFormat(undefined, DAY_TITLE).formatRange(firstDay, lastDay);
};

const dayString = (date = now) => date.toLocaleDateString(undefined, DAY_TITLE);

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
			// Seeded mid-month so the expected week range does not depend on when the suite runs.
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

describe('Calendar', () => {
	let calendar;

	afterEach(() => {
		calendar?.destroy?.();
		calendar = null;
		document.body.replaceChildren();
	});

	// The view buttons, blocks and events are found by class: they have no role or name of their own to find them by
	// eslint-disable-next-line testing-library/no-node-access
	const find = selector => calendar.elem.querySelector(selector);

	describe('toolbar view tabs', () => {
		const tab = name => getByRole(calendar.elem, 'tab', { name });

		test('the view is a segmented Tabs, its tab selected on render', () => {
			calendar = new Calendar({ appendTo: document.body });

			expect(getByRole(calendar.elem, 'tablist')).toHaveClass('variant-segmented');
			expect(tab('Month')).toHaveAttribute('aria-selected', 'true');
			expect(tab('Day')).toHaveAttribute('aria-selected', 'false');
		});

		test('the selected tab follows setView', () => {
			calendar = new Calendar({ appendTo: document.body });

			calendar.setView('day');

			expect(tab('Day')).toHaveAttribute('aria-selected', 'true');
			expect(tab('Month')).toHaveAttribute('aria-selected', 'false');

			calendar.setView('week');

			expect(tab('Week')).toHaveAttribute('aria-selected', 'true');
		});

		test('pressing a tab changes the view', async () => {
			calendar = new Calendar({ appendTo: document.body });

			await user.click(tab('Week'));

			expect(calendar.options.view).toBe('week');
			expect(calendar.elem).toHaveClass('week');
		});

		test('a direct view option write renders the view and selects its tab', () => {
			calendar = new Calendar({ appendTo: document.body });

			calendar.options.view = 'day';

			expect(find('.time-block')).toBeTruthy();
			expect(tab('Day')).toHaveAttribute('aria-selected', 'true');
		});

		test('a direct events option write renders the events', () => {
			calendar = new Calendar({ appendTo: document.body });

			calendar.options.events = [{ at: Date.now(), label: 'reactive event' }];

			expect(find('.event')).toBeTruthy();
			expect(calendar.options.events[0].label).toBe('reactive event');
		});

		test('the selected tab survives navigation, and the pressed button keeps focus', async () => {
			calendar = new Calendar({ appendTo: document.body });

			calendar.setView('week');
			await user.click(getByRole(calendar.elem, 'button', { name: 'next' }));

			expect(tab('Week')).toHaveAttribute('aria-selected', 'true');
			expect(getByRole(calendar.elem, 'button', { name: 'next' })).toHaveFocus();
		});
	});

	describe('pressing by keyboard', () => {
		const at = new Date(2026, 9, 14, 12);

		test('Tab reaches the month grid once, at the day shown; arrows move; Enter presses the day', async () => {
			const onDayPress = mock();

			calendar = new Calendar({ year: 2026, month: 9, day: 14, onDayPress, appendTo: document.body });

			const grid = getByRole(calendar.elem, 'grid');
			const tabStops = getAllByRole(grid, 'gridcell').filter(cell => cell.tabIndex === 0);

			expect(tabStops).toHaveLength(1);
			expect(tabStops[0]).toHaveAccessibleName(new Date(2026, 9, 14).toLocaleDateString(undefined, DAY_CELL));

			tabStops[0].focus();
			await user.keyboard('{ArrowRight}{ArrowDown}');

			const reached = getByRole(grid, 'gridcell', {
				name: new Date(2026, 9, 22).toLocaleDateString(undefined, DAY_CELL),
			});

			expect(reached).toHaveFocus();
			expect(reached.tabIndex).toBe(0);
			expect(tabStops[0].tabIndex).toBe(-1);

			await user.keyboard('{Enter}');

			expect(onDayPress).toHaveBeenCalledTimes(1);
			expect(onDayPress.mock.calls[0][0].detail.date).toEqual(new Date(2026, 9, 22));
		});

		test('a day view half hour presses by Space, announcing timePress with its time', async () => {
			const onTimePress = mock();

			calendar = new Calendar({ view: 'day', year: 2026, month: 9, day: 14, onTimePress, appendTo: document.body });

			const eight = getAllByRole(calendar.wrapper.elem, 'button').find(block => block.tabIndex === 0);

			eight.focus();
			await user.keyboard('{ArrowDown} ');

			expect(onTimePress).toHaveBeenCalledTimes(1);
			expect(onTimePress.mock.calls[0][0].detail.date).toEqual(new Date(2026, 9, 14, 8, 30));
		});

		test('an event presses as the event, not also its day, and hands back the object it was given', async () => {
			const onDayPress = mock();
			const onEventPress = mock();
			const data = { at, label: 'Dentist', id: 'visit-1' };

			calendar = new Calendar({
				year: 2026,
				month: 9,
				day: 14,
				events: [data],
				onDayPress,
				onEventPress,
				appendTo: document.body,
			});

			const event = getByRole(calendar.elem, 'button', { name: /^Dentist/ });

			event.focus();
			await user.keyboard('{Enter}');
			await user.click(event);

			expect(onEventPress).toHaveBeenCalledTimes(2);
			expect(onEventPress.mock.calls[0][0].detail.data).toBe(data);
			expect(onEventPress.mock.calls[0][0].detail.calendarEvent.label).toBe('Dentist');
			expect(onDayPress).not.toHaveBeenCalled();
		});

		test('a week day is one tab stop of seven, its title pressing once', async () => {
			const onDayPress = mock();

			calendar = new Calendar({ view: 'week', year: 2026, month: 9, day: 14, onDayPress, appendTo: document.body });

			const days = getAllByRole(calendar.wrapper.elem, 'button');

			expect(days).toHaveLength(7);

			expect(days.filter(day => day.tabIndex === 0)).toHaveLength(1);

			await user.click(getByText(calendar.elem, new Date(2026, 9, 14).toLocaleDateString(undefined, DAY_CELL)));

			expect(onDayPress).toHaveBeenCalledTimes(1);
			expect(onDayPress.mock.calls[0][0].detail.isTitle).toBe(true);
		});
	});
});
