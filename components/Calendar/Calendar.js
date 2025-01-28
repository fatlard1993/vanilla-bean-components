/* eslint-disable spellcheck/spell-checker */
import { styled } from '../../styled';
import { Component } from '../../Component';

import CalendarEvent from './CalendarEvent';
import Toolbar from './Toolbar';
import { getDaysInMonth, toNth } from './utils';

const StyledComponent = styled(
	Component,
	({ colors }) => `
		user-select: none;
		display: flex;
		flex-direction: column;
		gap: 6px;

		&.month {
			tr.title {
				font-size: 1.3em;
				height: 1.3em;
				color: ${colors.black};
				background-color: ${colors.lightest(colors.gray)};

				td {
					text-align: center;
				}
			}
		}

		&.day {
			div.event-container {
				position: absolute;
				height: 100%;
				width: 90%;
				top: 0;
				right: 0;
				pointer-events: none;

				div.event {
					position: absolute;
					pointer-events: all;
					width: 100%;
					text-indent: 6px;
				}
			}

			div.time-block {
				height: 3em;
				cursor: pointer;
				color: black;
				background-color: ${colors.light(colors.gray)};

				&:nth-child(odd) {
					background-color: ${colors.lighter(colors.gray)};
				}

				&:last-of-type{
					border-bottom: none;
				}

				span.time {
					font-size: 12px;
					margin: 2px;
					pointer-events: none;
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
		background-color: ${colors.lighter(colors.gray)};
		cursor: pointer;
		padding: 3px;

		span.day-title {
			display: block;
			font-size: 1em;
			padding: 2px;
			background-color: ${colors.black.setAlpha(0.2)};
			color: ${colors.black};
			cursor: pointer;
		}

		&:hover {
			background-color: ${colors.blue};

			span.day-title {
				background-color: ${colors.white.setAlpha(0.3)};
			}
		}

		&.today {
			background-color: ${colors.purple};

			span.day-title {
				background-color: ${colors.white.setAlpha(0.3)};
			}
		}

		&.not-in-month {
			background: #222;

			span.day-title {
				color: ${colors.gray};
			}
		}
	`,
);

const WeekDayCell = styled(
	Component,
	({ colors }) => `
		cursor: pointer;
		background-color: ${colors.lighter(colors.gray)};
		min-height: 14.285714285714286%;

		&.today {
			background-color: ${colors.blue};
		}

		div.day-title {
			cursor: pointer;
			padding: 6px;
			background-color: ${colors.black.setAlpha(0.2)};
			font-size: 1em;
			color: black;
		}

		.event {
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

class Calendar extends StyledComponent {
	constructor(options = {}, ...children) {
		super(
			{
				view: 'month',
				height: '420px',
				...options,
				events: (options.events || []).map(eventItem => new CalendarEvent(eventItem)),
			},
			...children,
		);
	}

	_setOption(key, value) {
		if (key === 'height') this.elem.style.height = value;
		else super._setOption(key, value);
	}

	render() {
		super.render();

		this.toolbar = new Toolbar({ appendTo: this, calendar: this, views: this.options.views });
		this.wrapper = new CalendarWrapper({ appendTo: this });

		if (!this.options.month) {
			const now = new Date();

			this.setDate(now.getFullYear(), now.getMonth(), now.getDate());

			this.adjustDateToView();
		}

		if (this.options.view === 'day') this.renderDay();
		else if (this.options.view === 'week') this.renderWeek();
		else this.renderMonth();

		this.wrapper.elem.scrollTop = 0;

		if (document.activeElement) document.activeElement.blur();
	}

	renderDay() {
		this.removeClass('month', 'week');
		this.addClass('day');

		this.toolbar.title.elem.textContent = `${MONTHS[this.options.month]} ${this.options.day}${toNth(
			this.options.day,
		)}, ${this.options.year}`;

		const eventContainer = new Component({ addClass: 'event-container', appendTo: this.wrapper });
		const events = this.eventsAt(`${this.options.year}/${this.options.month + 1}/${this.options.day}`);
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

			const fullDate = `${m + 1}/${d}/${y}`;
			const events = this.eventsAt(fullDate);
			const isToday = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();

			const weekdayCell = new WeekDayCell({
				addClass: isToday ? 'today' : undefined,
				data: { at: cDay.getTime(), fullDate },
				onPointerPress: ({ target }) => {
					this.emit('selectDay', { target, fullDate });
				},
				appendTo: this.wrapper,
			});

			new Component({
				textContent: `${DAYS[w]}, ${MONTHS[m]} ${d}${toNth(d)}`,
				addClass: 'day-title',
				appendTo: weekdayCell,
				onPointerPress: ({ target }) => {
					this.emit('selectDay', { target, isTitle: true, fullDate });
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
		} else if (firstDay.getYear() === lastDay.getYear()) {
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
				const fullDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
				const eventContainer = new Component({ addClass: 'event-container' });
				const td = new MonthDayCell({
					tag: 'td',
					addClass: isCurrentMonth && currentDay === dayX ? 'today' : undefined,
					data: { at: date.getTime(), fullDate },
					appendTo: tr,
					onPointerPress: event => {
						this.emit('selectDay', { target: event.target, fullDate });
					},
					append: [
						new Component({
							tag: 'span',
							textContent: date.getDate(),
							addClass: 'day-title',
							onPointerPress: event => {
								this.emit('selectDay', { target: event.target, isTitle: true, fullDate });
							},
						}),
						eventContainer,
					],
				});

				if (dayX <= 0 || dayX > month.numberOfDays) td.addClass('not-in-month');

				this.eventsAt(fullDate).forEach(calendarEvent => {
					if (calendarEvent.render) calendarEvent.render(this.options.view, eventContainer.elem, this);
				});
			}
		}

		this.toolbar.title.elem.textContent = MONTHS[this.options.month] + ' ' + this.options.year;
	}

	adjustDateToView() {
		if (this.options.view !== 'week' || this.options.weekday === this.options.day || this.options.day > 8) return;

		--this.options.month;

		if (this.options.month < 0) {
			--this.options.year;

			this.options.month = 11;
		}

		this.options.day = getDaysInMonth(this.options.year, this.options.month).numberOfDays;
	}

	setDate(year, month, day, reRender) {
		this.options.year = Number.parseInt(year);
		this.options.month = Number.parseInt(month);
		this.options.day = Number.parseInt(day);
		this.options.weekday = new Date(year, month, day).getDay();

		if (reRender) this.render();
	}

	today() {
		const now = new Date();

		this.setDate(now.getFullYear(), now.getMonth(), now.getDate());

		this.adjustDateToView();

		this.render();
	}

	previous() {
		if (this.options.view === 'day') {
			--this.options.day;

			if (this.options.day <= 0) {
				--this.options.month;

				if (this.options.month < 0) {
					this.options.month = 11;

					--this.options.year;
				}

				const monthStat = getDaysInMonth(this.options.year, this.options.month);

				this.options.day = monthStat.numberOfDays;
			}
		} else if (this.options.view === 'month') {
			--this.options.month;

			if (this.options.month < 0) {
				this.options.month = 11;

				--this.options.year;
			}
		} else if (this.options.view === 'week') {
			this.options.day -= 7;

			if (this.options.day <= 0) {
				--this.options.month;

				if (this.options.month < 0) {
					this.options.month = 11;

					--this.options.year;
				}

				const monthStat = getDaysInMonth(this.options.year, this.options.month);

				this.options.day = monthStat.numberOfDays + this.options.day;
			}
		}

		this.setDate(this.options.year, this.options.month, this.options.day);

		this.render();
	}

	next() {
		if (this.options.view === 'day') {
			++this.options.day;

			const monthStat = getDaysInMonth(this.options.year, this.options.month);

			if (this.options.day > monthStat.numberOfDays) {
				this.options.day = 1;

				++this.options.month;

				if (this.options.month > 11) {
					this.options.month = 0;

					++this.options.year;
				}
			}
		} else if (this.options.view === 'month') {
			++this.options.month;

			if (this.options.month > 11) {
				this.options.month = 0;

				++this.options.year;
			}
		} else if (this.options.view === 'week') {
			this.options.day += 7;

			const monthStat = getDaysInMonth(this.options.year, this.options.month);

			if (this.options.day > monthStat.numberOfDays) {
				++this.options.month;

				if (this.options.month > 11) {
					this.options.month = 0;

					++this.options.year;
				}

				const monthStat = getDaysInMonth(this.options.year, this.options.month);

				this.options.day -= monthStat.numberOfDays;
			}
		}

		this.setDate(this.options.year, this.options.month, this.options.day);

		this.render();
	}

	goToDay(position) {
		const date = new Date(position);

		this.setDate(date.getFullYear(), date.getMonth(), date.getDate());

		this.setView('day');
	}

	setView(view) {
		if (this.options.view !== view) {
			this.options.view = view;

			const pressed = this.toolbar.elem.querySelector('.pressed');
			const toPress = this.toolbar.elem.querySelector(`.set-${view}`);

			if (pressed) pressed.classList.remove('pressed');
			if (toPress) toPress.classList.add('pressed');

			this.adjustDateToView();
			this.render();
		}

		return this;
	}

	eventsAt(date) {
		date = new Date(date);

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
