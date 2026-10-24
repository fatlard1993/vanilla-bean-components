/* eslint-disable spellcheck/spell-checker */
import { styled } from '../../styled';
import { Component } from '../../Component';
import { Elem } from '../../Elem';

import { fontSize, media, radius, space } from '../../theme/tokens';
import { capitalize, daysInMonth, formatDate, formatDuration, formatTime } from '../../utils';
import { Button } from '../Button';
import { Tabs } from '../Tabs';
import { Toolbar } from '../Toolbar';
import CalendarEvent from './CalendarEvent';

const VIEWS = Object.freeze(['day', 'week', 'month']);

// The arrow keys' step through a run of cells laid out `columns` wide; Home and End go to the ends of the row
const GRID_KEYS = {
	ArrowLeft: () => -1,
	ArrowRight: () => 1,
	ArrowUp: columns => -columns,
	ArrowDown: columns => columns,
};

const EventChip = styled(
	Component,
	({ colors, focusRing }) => `
		cursor: pointer;
		color: ${colors.mostReadable(colors.selected, [colors.white, colors.black])};
		background-color: ${colors.selected};

		& div {
			pointer-events: none;
		}

		&:hover {
			filter: brightness(1.15);
		}

		/* Inside the event: its cell clips what reaches past it */
		&:focus-visible {
			${focusRing('-2px')}
		}
	`,
);

const StyledComponent = styled(
	Component,
	({ colors, focusRing }) => `
		user-select: none;
		display: flex;
		flex-direction: column;
		gap: ${space.sm};

		& > .calendar-toolbar {
			margin: 0;
			justify-content: space-between;
		}

		& .calendar-title {
			flex: 1 1 auto;
			text-align: center;
		}

		/* Previous, today and next: one control in three parts */
		& .calendar-nav {
			display: flex;

			& > .vbc-button {
				border-radius: 0;
			}

			& > .vbc-button:first-child {
				border-radius: ${radius.md} 0 0 ${radius.md};
			}

			& > .vbc-button:last-child {
				border-radius: 0 ${radius.md} ${radius.md} 0;
			}
		}

		&.month {
			& tr.title {
				font-size: ${fontSize.xl};
				height: ${fontSize.xl};
				color: ${colors.lightest(colors.gray)};
				background-color: ${colors.darkest(colors.gray)};

				& th {
					font-weight: normal;
					text-align: center;
				}

				& th:hover {
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
					/* Offsets, not a width. Overlap resolution assigns left/right percentages so
					   simultaneous events share the row, and an explicit width over-constrained the
					   box against them — 'right' was dropped, so every event rendered full-width and
					   sat on top of its neighbours. Defaulting both offsets to 0 keeps a lone event
					   spanning the container, which is what the width was for, while letting the
					   assigned percentages actually narrow the box. */
					left: 0;
					right: 0;
					text-indent: 6px;
				}
			}

			& div.time-block {
				height: 3em;

				&:focus-visible {
					${focusRing('-2px')}
				}

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
					font-size: ${fontSize.xs};
					margin: 2px;
					padding: 1px ${space.xs};
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

		td, th {
			max-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		/* A phone's columns fit "S", not "Sunday" */
		th .narrow {
			display: none;
		}

		@media ${media.phone} {
			th .long {
				display: none;
			}

			th .narrow {
				display: inline;
			}
		}
	`,
);

const MonthDayCell = styled(
	Component,
	({ colors, focusRing }) => `
		&:focus-visible {
			${focusRing('-2px')}
		}

		position: relative;
		border-collapse: collapse;
		vertical-align: top;
		background-color: ${colors.darker(colors.gray)};
		cursor: pointer;
		padding: ${space.xs};
		/* definite height so the inner flex column can fill the cell */
		height: 1px;

		& div.cell-body {
			display: flex;
			flex-direction: column;
			height: 100%;
		}

		& span.day-title {
			display: block;
			font-size: ${fontSize.md};
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
			border-radius: ${radius.md};
			padding: ${space.xs};
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
	({ colors, focusRing }) => `
		cursor: pointer;

		&:focus-visible {
			${focusRing('-2px')}
		}

		background-color: ${colors.darker(colors.gray)};
		min-height: 14.285714285714286%;

		& div.day-title {
			cursor: pointer;
			padding: ${space.sm};
			background-color: ${colors.alpha(colors.black, 0.2)};
			font-size: ${fontSize.md};
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

// The keys of a recurring event's `weekdays`, Sunday first as Date.getDay() counts
const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DAY_TITLE = { month: 'long', day: 'numeric', year: 'numeric' };

/**
 * Interactive calendar component supporting month, week, and day views with event management.
 *
 * Provides full calendar functionality with navigation, event display, and user interaction.
 * Supports multiple view modes, event rendering, and date selection with customizable styling. Days, half hours and
 * events press by keyboard as by pointer: Tab reaches the grid, the arrow keys (and Home and End) move between its
 * cells, and Enter or Space presses one.
 * @param {object} [options={}] - Calendar configuration options
 * @param {('month'|'week'|'day')} [options.view='month'] - Initial calendar view mode
 * @param {string} [options.height='420px'] - Calendar component height
 * @param {number} [options.year] - Initial year to display, defaults to current year
 * @param {number} [options.month] - Initial month to display (0-11), defaults to current month
 * @param {number} [options.day] - Initial day to display, defaults to current day
 * @param {number} [options.weekday] - Day-of-week index (0-6, Sunday first) as returned by Date.getDay(); set from the selected date and read by the week view
 * @param {Array<object>} [options.events=[]] - Calendar events array, automatically converted to CalendarEvent instances
 * @param {Array<string>} [options.views] - Available view modes for toolbar
 * @param {boolean} [options.display24h] - Whether to display time in 24-hour format in day view
 * @param {Function} [options.onDayPress] - Hears `dayPress`, a day pressed in the month or week view; `event.detail` is
 *   { date, target, isTitle } (isTitle when its title was pressed)
 * @param {Function} [options.onTimePress] - Hears `timePress`, a half hour pressed in the day view; `event.detail` is
 *   { date, target }
 * @param {Function} [options.onEventPress] - Hears `eventPress`, an event pressed; `event.detail` is
 *   { calendarEvent, data, target }, data being the object it was given as
 * @param {Function} [options.onNewEvent] - Hears `newEvent` when addEvent() adds one; `event.detail` is what was added
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
			set(value) {
				if (!this.rendered) return;
				this._viewTabs.options.selected = value;
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

	static events = ['dayPress', 'timePress', 'eventPress', 'newEvent'];

	static prepareOptions(options) {
		return {
			...options,
			events: options.events.map(eventItem => new CalendarEvent(eventItem)),
		};
	}

	build() {
		this._title = new Component({ addClass: 'calendar-title', attributes: { 'aria-live': 'polite' } });

		this._viewTabs = new Tabs({
			variant: 'segmented',
			'aria-label': 'View',
			tabs: this.options.views.map(view => ({ id: view, label: capitalize(view) })),
			selected: this.options.view,
			onChange: ({ value }) => this.setView(value),
		});

		this.toolbar = new Toolbar({
			addClass: 'calendar-toolbar',
			gap: space.sm,
			appendTo: this,
			append: [
				new Component({
					addClass: 'calendar-nav',
					append: ['previous', 'today', 'next'].map(
						action =>
							new Button({
								textContent: { next: '>', today: 'Today', previous: '<' }[action],
								'aria-label': action,
								onPointerPress: () => this[action](),
							}),
					),
				}),
				this._title,
				this._viewTabs,
			],
		});

		this.wrapper = new CalendarWrapper({ appendTo: this, onKeyDown: event => this._roveKey(event) });

		if (this.options.month == null) {
			const now = new Date();

			this.setDate(now.getFullYear(), now.getMonth(), now.getDate());

			this.adjustDateToView();
		}

		this.renderView();

		this.wrapper.elem.scrollTop = 0;
	}

	renderDay() {
		this.removeClass('month', 'week');
		this.addClass('day');

		this._title.elem.textContent = formatDate(
			new Date(this.options.year, this.options.month, this.options.day),
			DAY_TITLE,
		);

		const eventContainer = new Component({ addClass: 'event-container', appendTo: this.wrapper });
		const events = this.eventsAt(new Date(this.options.year, this.options.month, this.options.day));
		const minGap = 30;
		const gapsPerHour = Math.ceil(60 / minGap);

		const blocks = [];

		for (let x = 0; x < 24; ++x) {
			for (let y = 0; y < gapsPerHour; ++y) {
				const at = new Date(this.options.year, this.options.month, this.options.day, x, y * minGap);
				const time = formatTime(at, { hour12: !this.options.display24h });

				blocks.push(
					new Component({
						addClass: 'time-block',
						'aria-label': time,
						tabIndex: -1,
						pressable: true,
						appendTo: this.wrapper,
						append: new Component({ tag: 'span', addClass: 'time', textContent: time }),
						onPointerPress: ({ target }) => this.emit('timePress', { target, date: at }),
					}).elem,
				);
			}
		}

		// The block to start from: the hour now on today, else the morning
		const hour = this.isToday(new Date(this.options.year, this.options.month, this.options.day))
			? new Date().getHours()
			: 8;

		this._rove(blocks, 1, blocks[hour * gapsPerHour]);

		const groups = {};
		let smallestGap = -1;

		events.forEach(event => {
			const elem = this.renderEvent(event, eventContainer);
			event.elem = elem;
			event.ratio = 100;
			elem.style.left = '0';

			// Which gap slot the event starts in (fractional - a start time that falls mid-slot
			// spills into the next one below), and how many slots its duration spans.
			event.gapCell = (event.hour * 60 + event.minute) / minGap;
			event.gapCount = Math.max(1, Math.ceil((event.duration || minGap) / minGap));

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
		const cells = [];

		for (let x = 0; x < 7; ++x) {
			const y = cDay.getFullYear();
			const m = cDay.getMonth();
			const d = cDay.getDate();
			const t = cDay.getTime();

			const cellDate = new Date(y, m, d);
			const events = this.eventsAt(cellDate);
			const isToday = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();

			const title = formatDate(cellDate, { weekday: 'long', month: 'long', day: 'numeric' });
			const weekdayCell = new WeekDayCell({
				addClass: isToday ? 'today' : undefined,
				'aria-label': title,
				'aria-current': isToday ? 'date' : undefined,
				tabIndex: -1,
				pressable: true,
				onPointerPress: ({ target }) => this.emit('dayPress', { target, date: cellDate }),
				appendTo: this.wrapper,
			});

			new Component({
				textContent: title,
				addClass: 'day-title',
				appendTo: weekdayCell,
				onPointerPress: event => this._pressTitle(event, cellDate),
			});

			for (const calendarEvent of events) this.renderEvent(calendarEvent, weekdayCell);

			cells.push(weekdayCell.elem);

			cDay = new Date(t + dayMs);
		}

		this._rove(cells, 1, cells[day.getDay()]);

		this._title.elem.textContent = new Intl.DateTimeFormat(undefined, DAY_TITLE).formatRange(firstDay, lastDay);
	}

	renderMonth() {
		this.removeClass('week', 'day');
		this.addClass('month');

		const numberOfDays = daysInMonth(this.options.year, this.options.month);
		const now = new Date();
		const isCurrentMonth = now.getMonth() === this.options.month && now.getFullYear() === this.options.year;
		const currentDay = now.getDate();
		const monthTitle = formatDate(new Date(this.options.year, this.options.month), { month: 'long', year: 'numeric' });
		const table = new MonthCalendar({ tag: 'table', role: 'grid', 'aria-label': monthTitle, appendTo: this.wrapper });
		const titleRow = new Component({ tag: 'tr', addClass: 'title', appendTo: table });
		const cells = [];
		let focusCell;
		let dayX = -new Date(this.options.year, this.options.month).getDay();

		// 4 January 1970 was a Sunday
		for (let day = 0; day < 7; ++day) {
			new Component({
				tag: 'th',
				scope: 'col',
				abbr: formatDate(new Date(1970, 0, 4 + day), { weekday: 'long' }),
				append: ['long', 'narrow'].map(
					weekday =>
						new Elem({
							tag: 'span',
							addClass: weekday,
							textContent: formatDate(new Date(1970, 0, 4 + day), { weekday }),
						}),
				),
				appendTo: titleRow,
			});
		}

		for (let row = 0; row < 6; ++row) {
			const tr = new Component({ tag: 'tr', appendTo: table });

			for (let col = 0; col < 7; ++col) {
				const date = new Date(this.options.year, this.options.month, ++dayX);
				const eventContainer = new Component({ addClass: 'event-container' });
				const isToday = isCurrentMonth && currentDay === dayX;
				const td = new MonthDayCell({
					tag: 'td',
					role: 'gridcell',
					'aria-label': formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' }),
					'aria-current': isToday ? 'date' : undefined,
					tabIndex: -1,
					pressable: true,
					addClass: isToday ? 'today' : undefined,
					appendTo: tr,
					onPointerPress: ({ target }) => this.emit('dayPress', { target, date }),
					append: new Component(
						{ addClass: 'cell-body' },
						new Component({
							tag: 'span',
							textContent: date.getDate(),
							addClass: 'day-title',
							onPointerPress: event => this._pressTitle(event, date),
						}),
						eventContainer,
					),
				});

				if (dayX <= 0 || dayX > numberOfDays) td.addClass('not-in-month');
				else if (dayX === this.options.day) focusCell = td.elem;

				cells.push(td.elem);

				for (const calendarEvent of this.eventsAt(date)) this.renderEvent(calendarEvent, eventContainer);
			}
		}

		this._rove(cells, 7, focusCell);

		this._title.elem.textContent = monthTitle;
	}

	/**
	 * Draws one event into a day: pressable, by pointer or keyboard, announcing `eventPress` with the event. A press on an
	 * event is the event's, not also its day's.
	 * @param {CalendarEvent} calendarEvent - The event
	 * @param {Component|HTMLElement} container - Where it goes
	 * @returns {HTMLElement} Its element
	 */
	renderEvent(calendarEvent, container) {
		const duration = formatDuration(calendarEvent.duration);
		const when = [formatTime(calendarEvent.at, { hour12: !this.options.display24h }), duration]
			.filter(Boolean)
			.join(', ');

		const chip = new EventChip({
			className: 'event',
			pressable: true,
			'aria-label': `${calendarEvent.label}, ${when}`,
			style: { backgroundColor: calendarEvent.color },
			append: [
				new Elem({ className: 'time', textContent: when }),
				new Elem({ className: 'label', textContent: calendarEvent.label }),
			],
			appendTo: container,
			onPointerPress: event => {
				event.stopPropagation();
				this.emit('eventPress', { target: chip.elem, calendarEvent, data: calendarEvent.data });
			},
		});

		if (this.options.view === 'day') {
			const gapPosition = calendarEvent.at.getHours() * 2 + calendarEvent.at.getMinutes() / 30;

			Object.assign(chip.elem.style, {
				height: `${(calendarEvent.duration ? Math.ceil(calendarEvent.duration / 1000 / 60 / 30) : 1) * 3}em`,
				top: `${gapPosition * 3}em`,
				left: '0',
				zIndex: Math.floor(gapPosition),
			});
		}

		return chip.elem;
	}

	/**
	 * Whether a date is today.
	 * @param {Date} date - The date
	 * @returns {boolean} Whether it's today
	 */
	isToday(date) {
		return date.toDateString() === new Date().toDateString();
	}

	// A press on a day's title is the day's, marked as the title's; once, not again as it reaches the day
	_pressTitle(event, date) {
		event.stopPropagation();
		this.emit('dayPress', { target: event.target, isTitle: true, date });
	}

	// One tab stop for a run of cells, the arrow keys moving it: Tab reaches the grid, not each of its days
	_rove(cells, columns, start = cells.find(cell => !cell.classList.contains('not-in-month'))) {
		this._roving = { cells, columns };

		if (start ?? cells[0]) (start ?? cells[0]).tabIndex = 0;
	}

	_roveKey(event) {
		const { cells = [], columns = 1 } = this._roving ?? {};
		const from = cells.indexOf(event.target);
		const step = GRID_KEYS[event.key]?.(columns);
		let to;

		if (from < 0 || event.altKey || event.ctrlKey || event.metaKey) return;

		if (step !== undefined) to = from + step;
		else if (event.key === 'Home') to = from - (from % columns);
		else if (event.key === 'End') to = from - (from % columns) + columns - 1;

		if (to === undefined || !cells[to]) return;

		event.preventDefault();
		cells[from].tabIndex = -1;
		cells[to].tabIndex = 0;
		cells[to].focus();
	}

	adjustDateToView() {
		// Week view anchors on the month the week *starts* in, so a week spanning a month boundary is
		// rendered from the earlier month. The week starts in the previous month exactly when its
		// Sunday falls before the 1st -- `day - weekday < 1`. The guard used to ask whether
		// `weekday < day`, which holds for most of any month's first week, so an ordinary date like
		// Tuesday the 4th was pulled back a month and the calendar opened on the wrong week entirely.
		// Derived, not read from `options.weekday`: that option is only populated by `setDate()`, so a
		// caller who constructs with an explicit year/month/day leaves it undefined and any arithmetic
		// on it yields NaN -- which compares false against everything and silently drops through.
		if (this.options.view !== 'week') return;

		const weekday = new Date(this.options.year, this.options.month, this.options.day).getDay();

		if (this.options.day - weekday >= 1) return;

		let { year, month } = this.options;
		--month;
		if (month < 0) {
			--year;
			month = 11;
		}

		this.setDate(year, month, daysInMonth(year, month));
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

		if (reRender) this._redraw();
	}

	/**
	 * Navigates the calendar to today's date and re-renders.
	 */
	today() {
		const now = new Date();

		this.setDate(now.getFullYear(), now.getMonth(), now.getDate());

		this.adjustDateToView();

		this._redraw();
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
				day = daysInMonth(year, month);
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
				day = daysInMonth(year, month) + day;
			}
		}

		this.setDate(year, month, day);
		this._redraw();
	}

	/**
	 * Navigates to the next time period based on current view (day/week/month).
	 */
	next() {
		let { year, month, day } = this.options;

		if (this.options.view === 'day') {
			++day;
			const monthDays = daysInMonth(year, month);

			if (day > monthDays) {
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
			const monthDays = daysInMonth(year, month);

			if (day > monthDays) {
				day -= monthDays;
				++month;
				if (month > 11) {
					month = 0;
					++year;
				}
			}
		}

		this.setDate(year, month, day);
		this._redraw();
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

	// Navigation redraws the view and its title, leaving the toolbar (and the button just pressed, which keeps focus)
	_redraw() {
		if (this.rendered) this.renderView();
		else this.render();
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
				event.weekdays[WEEKDAY_KEYS[date.getDay()]] &&
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

			this._redraw();
		}

		return this;
	}
}

export default Calendar;
