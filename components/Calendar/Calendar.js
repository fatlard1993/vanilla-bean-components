/* eslint-disable spellcheck/spell-checker */
import { styled } from '../../styled';
import { Component } from '../../Component';

import CalendarEvent from './CalendarEvent';
import Toolbar, { VIEWS } from './Toolbar';
import { getDaysInMonth, toNth } from './utils';

const StyledComponent = styled(
	Component,
	({ colors }) => `
		user-select: none;
		display: flex;
		flex-direction: column;
		gap: 6px;

		&.month {
			& tr.title {
				font-size: 1.3em;
				height: 1.3em;
				color: ${colors.lightest(colors.gray)};
				background-color: ${colors.darkest(colors.gray)};

				& td {
					text-align: center;
				}

				& td:hover {
					background-color: unset;
					color: unset;
				}
			}
		}

		&.day {
			& div.event-container {
				position: absolute;
				height: 100%;
				width: 90%;
				top: 0;
				right: 0;
				pointer-events: none;

				& div.event {
					position: absolute;
					pointer-events: all;
					width: 100%;
					text-indent: 6px;
				}
			}

			& div.time-block {
				height: 3em;
				cursor: pointer;
				color: ${colors.lighter(colors.gray)};
				background-color: ${colors.darker(colors.gray)};

				&:nth-child(odd) {
					background-color: ${colors.darkest(colors.gray)};
				}

				&:last-of-type{
					border-bottom: none;
				}

				& span.time {
					font-size: 12px;
					margin: 2px;
					padding: 1px 3px;
					pointer-events: none;
				}

				&:hover span.time {
					background-color: ${colors.light(colors.selected)};
					color: ${colors.mostReadable(colors.light(colors.selected), [colors.white, colors.black])};
					font-weight: 700;
				}
			}
		}
	`,
);

const CalendarWrapper = styled(
	Component,
	() => `
		position: relative;
		overflow: auto;
		width: 100%;
		flex: 1;
	`,
);

const MonthCalendar = styled(
	Component,
	() => `
		width: 100%;
		height: 100%;

		td {
			max-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	`,
);

const MonthDayCell = styled(
	Component,
	({ colors }) => `
		position: relative;
		border-collapse: collapse;
		vertical-align: top;
		background-color: ${colors.darker(colors.gray)};
		cursor: pointer;
		padding: 3px;
		/* definite height so the inner flex column can fill the cell */
		height: 1px;

		& div.cell-body {
			display: flex;
			flex-direction: column;
			height: 100%;
		}

		& span.day-title {
			display: block;
			font-size: 1em;
			padding: 2px;
			background-color: ${colors.alpha(colors.black, 0.2)};
			color: ${colors.lightest(colors.gray)};
			cursor: pointer;
		}

		& div.event-container {
			background: ${colors.alpha(colors.black, 0.05)};
			flex: 1;
			min-height: 0;
			margin-top: 2px;
			border-radius: 6px;
			padding: 3px;
		}

		/* Pin the box color - the page theme's global td:hover darkening must not show through */
		&:hover {
			background-color: ${colors.darker(colors.gray)};
		}

		&:hover span.day-title,
		&.today:hover span.day-title,
		&.not-in-month:hover span.day-title {
			background-color: ${colors.light(colors.selected)};
			color: ${colors.mostReadable(colors.light(colors.selected), [colors.white, colors.black])};
			font-weight: 700;
		}

		&.today span.day-title {
			box-shadow: inset 0 -3px 0 ${colors.selected};
			color: ${colors.white};
			font-weight: 700;
		}

		&.not-in-month {
			& span.day-title {
				color: ${colors.gray};
				background: ${colors.alpha(colors.black, 0.3)};
			}

			& div.event-container {
				background: ${colors.alpha(colors.black, 0.3)};
			}
		}
	`,
);

const WeekDayCell = styled(
	Component,
	({ colors }) => `
		cursor: pointer;
		background-color: ${colors.darker(colors.gray)};
		min-height: 14.285714285714286%;

		& div.day-title {
			cursor: pointer;
			padding: 6px;
			background-color: ${colors.alpha(colors.black, 0.2)};
			font-size: 1em;
			color: ${colors.lightest(colors.gray)};
		}

		&:hover div.day-title,
		&.today:hover div.day-title {
			background-color: ${colors.light(colors.selected)};
			color: ${colors.mostReadable(colors.light(colors.selected), [colors.white, colors.black])};
			font-weight: 700;
		}

		&.today div.day-title {
			box-shadow: inset 0 -3px 0 ${colors.selected};
			color: ${colors.white};
			font-weight: 700;
		}

		& .event {
			text-indent: 6px;
		}
	`,
);

const DayNowIndicator = styled(
	Component,
	({ colors }) => `
		position: absolute;
		width: 105%;
		height: 2px;
		background-color: ${colors.red};
		z-index: 34;
		left: -5em;
	`,
);

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

/**
 * Interactive calendar component supporting month, week, and day views with event management.
 *
 * Provides full calendar functionality with navigation, event display, and user interaction.
 * Supports multiple view modes, event rendering, and date selection with customizable styling.
 * @param {object} [options={}] - Calendar configuration options
 * @param {('month'|'week'|'day')} [options.view='month'] - Initial calendar view mode
 * @param {string} [options.height='420px'] - Calendar component height
 * @param {number} [options.year] - Initial year to display, defaults to current year
 * @param {number} [options.month] - Initial month to display (0-11), defaults to current month
 * @param {number} [options.day] - Initial day to display, defaults to current day
 * @param {Array<object>} [options.events=[]] - Calendar events array, automatically converted to CalendarEvent instances
 * @param {Array<string>} [options.views] - Available view modes for toolbar
 * @param {boolean} [options.display24h] - Whether to display time in 24-hour format in day view
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Calendar} Calendar component instance
 */
class Calendar extends StyledComponent {
	static schema = {
		height: {
			default: '420px',
			set(value) {
				this.elem.style.height = value;
			},
		},
		// Date state read from this.options by the view renderers; navigation methods
		// (setDate, next, previous) mutate several keys then re-render once
		view: {
			default: 'month',
			enum: ['month', 'week', 'day'],
			set() {
				if (!this.rendered) return;
				this.adjustDateToView();
				this.renderView();
			},
		},
		views: { default: VIEWS },
		events: {
			get default() {
				return [];
			},
			set(value) {
				// Normalize raw event objects; the re-assignment re-enters this set with instances only
				if (value?.some(eventItem => !(eventItem instanceof CalendarEvent))) {
					this.options.events = value.map(eventItem =>
						eventItem instanceof CalendarEvent ? eventItem : new CalendarEvent(eventItem),
					);
					return;
				}

				if (this.rendered) this.renderView();
			},
		},
		year: {},
		month: {},
		day: {},
		weekday: {},
		display24h: { default: false },
	};

	static events = ['selectDay', 'selectTime', 'selectEvent', 'newEvent'];

	static prepareOptions(options) {
		return {
			...options,
			events: options.events.map(eventItem => new CalendarEvent(eventItem)),
		};
	}

	build() {
		this.toolbar = new Toolbar({
			appendTo: this,
			calendar: this,
			views: this.options.views,
			view: this.options.subscriber('view'),
		});
		this.wrapper = new CalendarWrapper({ appendTo: this });

		if (this.options.month == null) {
			const now = new Date();

			this.setDate(now.getFullYear(), now.getMonth(), now.getDate());

			this.adjustDateToView();
		}

		this.renderView();

		this.wrapper.elem.scrollTop = 0;

		if (this.elem.contains(document.activeElement)) document.activeElement.blur();
	}

	renderDay() {
		this.removeClass('month', 'week');
		this.addClass('day');

		this.toolbar.title.elem.textContent = `${MONTHS[this.options.month]} ${this.options.day}${toNth(
			this.options.day,
		)}, ${this.options.year}`;

		const eventContainer = new Component({ addClass: 'event-container', appendTo: this.wrapper });
		const events = this.eventsAt(new Date(this.options.year, this.options.month, this.options.day));
		const minGap = 30;
		const gapsPerHour = Math.ceil(60 / minGap);

		for (let x = 0; x < 24; ++x) {
			for (let y = 0; y < gapsPerHour; ++y) {
				const minutesBlock = new Component({
					addClass: 'time-block',
					appendTo: this.wrapper,
					onPointerPress: event => {
						this.emit('selectTime', event);
					},
				});
				const timeSpan = new Component({ tag: 'span', addClass: 'time', appendTo: minutesBlock });

				const mins = y * minGap;
				let h = x;
				let am_pm = '';

				// minutesBlock.style.height = (this.options.dayViewGapHeight - 1) +'px';

				if (!this.options.display24h) {
					am_pm = h < 12 ? 'AM' : 'PM';
					h = h < 12 ? h : h % 12;
					h = h === 0 ? 12 : h;
				}

				timeSpan.elem.textContent = `${h}:${mins < 10 ? '0' : ''}${mins} ${am_pm}`;
			}
		}

		const groups = {};
		let smallestGap = -1;

		events.forEach(event => {
			const elem = event.render(this.options.view, eventContainer.elem, this);
			event.elem = elem;
			event.ratio = 100;
			elem.style.left = '0';

			let totalGaps = event.gapCount;

			if (Math.floor(event.gapCell) !== event.gapCell) ++totalGaps;

			for (let x = 0; x < totalGaps; ++x) {
				const gap = Math.floor(event.gapCell + x);

				groups[gap] = groups[gap] || [];

				groups[gap].push(event);
			}

			if (smallestGap === -1 || smallestGap > event.gapCell) smallestGap = event.gapCell;
		});

		Object.keys(groups).forEach(gap => {
			const total = groups[gap].length;
			const ratio = 100 / total;

			groups[gap].forEach((event, index) => {
				const minLeft = index * ratio;
				const minRight = ratio * (total - index - 1);

				if (ratio < event.ratio) {
					event.ratio = ratio;
					event.elem.style.left = minLeft + '%';
					event.elem.style.right = minRight + '%';
				}
			});
		});

		new DayNowIndicator({
			style: { top: `${(new Date().getHours() * 2 + new Date().getMinutes() / 30) * 3}em` },
			appendTo: eventContainer,
		});
	}

	renderWeek() {
		this.removeClass('month', 'day');
		this.addClass('week');

		const dayMs = 1000 * 60 * 60 * 24;
		const now = new Date();
		const day = new Date(this.options.year, this.options.month, this.options.day);
		const firstDay = new Date(day.getTime() - day.getDay() * dayMs);
		const lastDay = new Date(firstDay.getTime() + 6 * dayMs);

		let cDay = new Date(firstDay.getTime());

		for (let x = 0; x < 7; ++x) {
			const y = cDay.getFullYear();
			const m = cDay.getMonth();
			const d = cDay.getDate();
			const w = cDay.getDay();
			const t = cDay.getTime();

			const cellDate = new Date(y, m, d);
			const events = this.eventsAt(cellDate);
			const isToday = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();

			const weekdayCell = new WeekDayCell({
				addClass: isToday ? 'today' : undefined,
				onPointerPress: ({ target }) => {
					this.emit('selectDay', { target, date: cellDate });
				},
				appendTo: this.wrapper,
			});

			new Component({
				textContent: `${DAYS[w]}, ${MONTHS[m]} ${d}${toNth(d)}`,
				addClass: 'day-title',
				appendTo: weekdayCell,
				onPointerPress: ({ target }) => {
					this.emit('selectDay', { target, isTitle: true, date: cellDate });
				},
			});

			for (let y = 0; y < events.length; ++y) events[y].render(this.options.view, weekdayCell.elem, this);

			cDay = new Date(t + dayMs);
		}

		const firstDayAppend = toNth(firstDay.getDate());
		const lastDayAppend = toNth(lastDay.getDate());

		if (firstDay.getMonth() === lastDay.getMonth()) {
			this.toolbar.title.elem.textContent =
				MONTHS[firstDay.getMonth()] +
				' ' +
				firstDay.getDate() +
				firstDayAppend +
				' - ' +
				lastDay.getDate() +
				lastDayAppend +
				', ' +
				this.options.year;
		} else if (firstDay.getFullYear() === lastDay.getFullYear()) {
			this.toolbar.title.elem.textContent =
				MONTHS[firstDay.getMonth()] +
				' ' +
				firstDay.getDate() +
				firstDayAppend +
				' - ' +
				MONTHS[lastDay.getMonth()] +
				' ' +
				lastDay.getDate() +
				lastDayAppend +
				', ' +
				this.options.year;
		} else {
			this.toolbar.title.elem.textContent =
				MONTHS[firstDay.getMonth()] +
				' ' +
				firstDay.getDate() +
				firstDayAppend +
				', ' +
				firstDay.getFullYear() +
				' - ' +
				MONTHS[lastDay.getMonth()] +
				' ' +
				lastDay.getDate() +
				lastDayAppend +
				', ' +
				lastDay.getFullYear();
		}
	}

	renderMonth() {
		this.removeClass('week', 'day');
		this.addClass('month');

		const month = getDaysInMonth(this.options.year, this.options.month);
		const now = new Date();
		const isCurrentMonth = now.getMonth() === this.options.month && now.getFullYear() === this.options.year;
		const currentDay = now.getDate();
		const table = new MonthCalendar({ tag: 'table', appendTo: this.wrapper });
		const titleRow = new Component({ tag: 'tr', addClass: 'title', appendTo: table });
		let dayX = -month.firstDay;

		for (let day = 0; day < 7; ++day) new Component({ tag: 'td', textContent: DAYS[day], appendTo: titleRow });

		for (let row = 0; row < 6; ++row) {
			const tr = new Component({ tag: 'tr', appendTo: table });

			for (let col = 0; col < 7; ++col) {
				const date = new Date(this.options.year, this.options.month, ++dayX);
				const eventContainer = new Component({ addClass: 'event-container' });
				const td = new MonthDayCell({
					tag: 'td',
					addClass: isCurrentMonth && currentDay === dayX ? 'today' : undefined,
					appendTo: tr,
					onPointerPress: event => {
						this.emit('selectDay', { target: event.target, date });
					},
					append: new Component(
						{ addClass: 'cell-body' },
						new Component({
							tag: 'span',
							textContent: date.getDate(),
							addClass: 'day-title',
							onPointerPress: event => {
								this.emit('selectDay', { target: event.target, isTitle: true, date });
							},
						}),
						eventContainer,
					),
				});

				if (dayX <= 0 || dayX > month.numberOfDays) td.addClass('not-in-month');

				this.eventsAt(date).forEach(calendarEvent => {
					if (calendarEvent.render) calendarEvent.render(this.options.view, eventContainer.elem, this);
				});
			}
		}

		this.toolbar.title.elem.textContent = MONTHS[this.options.month] + ' ' + this.options.year;
	}

	adjustDateToView() {
		if (this.options.view !== 'week' || this.options.weekday >= this.options.day || this.options.day > 8) return;

		let { year, month } = this.options;
		--month;
		if (month < 0) {
			--year;
			month = 11;
		}

		this.setDate(year, month, getDaysInMonth(year, month).numberOfDays);
	}

	/**
	 * Sets the calendar to display a specific date.
	 * @param {number} year - Year to set
	 * @param {number} month - Month to set (0-11)
	 * @param {number} day - Day to set
	 * @param {boolean} [reRender] - Whether to re-render the calendar after setting date
	 */
	setDate(year, month, day, reRender) {
		this.options.year = Number.parseInt(year);
		this.options.month = Number.parseInt(month);
		this.options.day = Number.parseInt(day);
		this.options.weekday = new Date(year, month, day).getDay();

		if (reRender) this.render();
	}

	/**
	 * Navigates the calendar to today's date and re-renders.
	 */
	today() {
		const now = new Date();

		this.setDate(now.getFullYear(), now.getMonth(), now.getDate());

		this.adjustDateToView();

		this.render();
	}

	/**
	 * Navigates to the previous time period based on current view (day/week/month).
	 */
	previous() {
		let { year, month, day } = this.options;

		if (this.options.view === 'day') {
			--day;

			if (day <= 0) {
				--month;
				if (month < 0) {
					month = 11;
					--year;
				}
				day = getDaysInMonth(year, month).numberOfDays;
			}
		} else if (this.options.view === 'month') {
			--month;
			if (month < 0) {
				month = 11;
				--year;
			}
		} else if (this.options.view === 'week') {
			day -= 7;

			if (day <= 0) {
				--month;
				if (month < 0) {
					month = 11;
					--year;
				}
				day = getDaysInMonth(year, month).numberOfDays + day;
			}
		}

		this.setDate(year, month, day);
		this.render();
	}

	/**
	 * Navigates to the next time period based on current view (day/week/month).
	 */
	next() {
		let { year, month, day } = this.options;

		if (this.options.view === 'day') {
			++day;
			const monthStat = getDaysInMonth(year, month);

			if (day > monthStat.numberOfDays) {
				day = 1;
				++month;
				if (month > 11) {
					month = 0;
					++year;
				}
			}
		} else if (this.options.view === 'month') {
			++month;
			if (month > 11) {
				month = 0;
				++year;
			}
		} else if (this.options.view === 'week') {
			day += 7;
			const monthStat = getDaysInMonth(year, month);

			if (day > monthStat.numberOfDays) {
				day -= monthStat.numberOfDays;
				++month;
				if (month > 11) {
					month = 0;
					++year;
				}
			}
		}

		this.setDate(year, month, day);
		this.render();
	}

	/**
	 * Navigates to a specific day and switches to day view.
	 * @param {number|Date} position - Date position as timestamp or Date object
	 */
	goToDay(position) {
		const date = new Date(position);

		this.setDate(date.getFullYear(), date.getMonth(), date.getDate());

		this.setView('day');
	}

	/**
	 * Changes the calendar view mode and updates the display.
	 * @param {string} view - View mode to set ('month', 'week', 'day')
	 * @returns {Calendar} This calendar instance for method chaining
	 */
	setView(view) {
		if (this.options.view !== view) this.options.view = view;

		return this;
	}

	/**
	 * Clears the wrapper and renders the current view.
	 */
	renderView() {
		this.wrapper.empty();

		if (this.options.view === 'day') this.renderDay();
		else if (this.options.view === 'week') this.renderWeek();
		else this.renderMonth();
	}

	/**
	 * Retrieves all events occurring on a specific date.
	 * @param {string|Date} date - Date to query for events
	 * @returns {Array<CalendarEvent>} Array of events occurring on the specified date
	 */
	eventsAt(date) {
		if (!(date instanceof Date)) date = new Date(date);

		const events = [];

		this.options.events.forEach(event => {
			if (!event.recurring) {
				if (event.year === date.getFullYear() && event.month === date.getMonth() + 1 && event.day === date.getDate())
					events.push(event);

				return;
			}

			if (!event.daily) {
				event.whitelist.forEach(dateItem => {
					dateItem = new Date(dateItem);

					if (
						dateItem.getFullYear() === date.getFullYear() &&
						dateItem.getMonth() === date.getMonth() &&
						dateItem.getDate() === date.getDate()
					)
						events.push(event);
				});

				return;
			}

			for (let x = 0, count = event.blacklist.length; x < count; ++x) {
				const dateItem = new Date(event.blacklist[x]);

				// if(parseInt(dateItem[2]) === date.getFullYear() && parseInt(dateItem[1]) === date.getMonth() + 1 && parseInt(dateItem[0]) === date.getDate() + 1) return;
				if (
					dateItem.getFullYear() === date.getFullYear() &&
					dateItem.getMonth() === date.getMonth() &&
					dateItem.getDate() === date.getDate()
				)
					return;
			}

			if (
				event.weekdays[DAYS[date.getDay()].toLowerCase()] &&
				(date.getFullYear() > event.year ||
					(date.getFullYear() === event.year && date.getMonth() + 1 > event.month) ||
					(date.getFullYear() === event.year && date.getMonth() + 1 === event.month && date.getDate() >= event.day))
			)
				events.push(event);
		});

		return events;
	}

	/**
	 * Adds a new event to the calendar and re-renders.
	 * @param {object} eventItem - Event data object to add
	 * @returns {Calendar} This calendar instance for method chaining
	 */
	addEvent(eventItem) {
		if (eventItem) {
			this.options.events.push(new CalendarEvent(eventItem, this));

			this.emit('newEvent', eventItem);

			this.render();
		}

		return this;
	}
}

export default Calendar;

// Zero-arg scenarios for LLD verification
export const navigateBackFromJanuary = () => {
	const c = new Calendar({ view: 'month', year: 2024, month: 0, autoRender: false });
	c.render();
	c.previous();
	return { month: c.options.month, year: c.options.year };
};
