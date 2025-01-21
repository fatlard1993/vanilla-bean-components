import { Component } from '../../Component';
import { Elem } from '../../Elem';
import { styled } from '../../styled';
import { formatDuration, formatTime } from './utils';

const StyledEvent = styled(
	Component,
	({ colors }) => `
		cursor: pointer;
		color: ${colors.black};
		background-color: ${colors.yellow};

		div {
			pointer-events: none;
		}
	`,
);

export default class CalendarEvent {
	constructor(data) {
		if (typeof data !== 'object') return false;

		this.options = data;

		this.at = new Date(data.at);

		if (!this.at) return false;

		this.label = data.label;
		this.notes = data.notes;
		this.color = data.color;
		this.duration = data.duration;
		this.year = this.at.getFullYear();
		this.month = this.at.getMonth() + 1;
		this.day = this.at.getDate();
		this.hour = this.at.getHours();
		this.minute = this.at.getMinutes();
		this.fullDate = `${this.month}/${this.day}/${this.year}`;

		return this;
	}

	render(type, container, calendar) {
		const formattedTime = formatTime(this.at);

		this.eventElem = new StyledEvent({
			data: { at: this.at },
			className: 'event',
			style: { backgroundColor: this.color },
			append: [
				new Elem({
					className: 'time',
					textContent: `${formattedTime}${this.duration ? formatDuration(this.duration, ', ') : ''}`,
				}),
				new Elem({ className: 'label', textContent: this.label }),
			],
			appendTo: container,
			onPointerPress: ({ target }) => {
				calendar.emit('selectEvent', { target, index: this.options.index });
			},
		});

		if (type === 'day') {
			const gapPosition = this.at.getHours() * 2 + this.at.getMinutes() / 30;
			const gapHeight = `${(this.duration ? Math.ceil(this.duration / 1000 / 60 / 30) : 1) * 3}em`;
			const gapTop = `${gapPosition * 3}em`;

			this.eventElem.elem.style.height = gapHeight;
			this.eventElem.elem.style.top = gapTop;
			this.eventElem.elem.style.left = '0';
			this.eventElem.elem.style.zIndex = Math.floor(gapPosition);

			if (this.duration) {
				this.eventElem.elem.children[0].textContent = formattedTime + formatDuration(this.duration, ', ');
			}
		}

		return this.eventElem.elem;
	}
}
