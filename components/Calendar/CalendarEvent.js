/**
 * One event on a Calendar: the record its views draw from, not a view of its own. A Calendar draws it once for each day
 * it falls on (a recurring event, many times), so it holds what the event is and leaves drawing to the Calendar; it is
 * not a Component, having no element of its own. A Calendar makes these from the plain objects in its `events`.
 * @param {object} data - The event
 * @param {Date|number|string} data.at - When it starts
 * @param {string} [data.label] - What it is
 * @param {string} [data.notes] - More about it
 * @param {string} [data.color] - Its background
 * @param {number} [data.duration] - How long it lasts, in milliseconds
 * @param {boolean} [data.recurring] - Whether it repeats: daily on `weekdays` (minus `blacklist` dates), or on the
 *   `whitelist` dates
 * @param {boolean} [data.daily] - A recurring event repeating on `weekdays`
 * @param {object} [data.weekdays] - The weekdays it repeats on, by lowercase English name: { monday: true }
 * @param {Array} [data.whitelist] - The dates a recurring, non-daily event falls on
 * @param {Array} [data.blacklist] - The dates a daily event skips
 * @returns {CalendarEvent} The event
 */
export default class CalendarEvent {
	constructor(data) {
		if (typeof data !== 'object' || data === null) throw new TypeError('CalendarEvent requires an object argument');

		// The caller's own object, handed back with a press so whatever else it carries (an id) comes with it
		this.data = data;

		this.at = new Date(data.at);

		if (Number.isNaN(this.at.getTime())) throw new TypeError('CalendarEvent requires a valid date (data.at)');

		this.label = data.label;
		this.notes = data.notes;
		this.color = data.color;
		this.duration = data.duration;
		this.recurring = data.recurring;
		this.daily = data.daily;
		this.whitelist = data.whitelist;
		this.blacklist = data.blacklist;
		this.weekdays = data.weekdays;
		this.year = this.at.getFullYear();
		this.month = this.at.getMonth() + 1;
		this.day = this.at.getDate();
		this.hour = this.at.getHours();
		this.minute = this.at.getMinutes();
		this.fullDate = `${this.month}/${this.day}/${this.year}`;
	}
}
