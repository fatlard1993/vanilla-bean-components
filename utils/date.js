const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Read a date from a Date, a timestamp or a string. A date-only string (2026-10-18) is that day where the reader is,
 * not midnight UTC, which is the day before anywhere west of Greenwich.
 * @param {Date|number|string} value - What to read
 * @returns {Date|null} The date, or null when there is none
 */
export const parseDate = value => {
	if (value === undefined || value === null || value === '') return null;

	const dateOnly = typeof value === 'string' && value.match(DATE_ONLY);

	if (dateOnly) {
		const [year, month, day] = dateOnly.slice(1).map(Number);
		const date = new Date(2000, month - 1, day);

		// setFullYear, since the constructor reads years 0 to 99 as 1900 to 1999
		date.setFullYear(year);

		// A day the month doesn't have (2026-02-31) rolls into the next month; that is no date
		return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
	}

	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Format a date for reading, in the reader's locale. A date-only string keeps its day; text that isn't a date is
 * returned as it was.
 * @param {Date|number|string} value - The date
 * @param {object} [options] - Intl.DateTimeFormat options, plus locale
 * @param {string} [options.locale] - Defaults to the reader's
 * @returns {string} The formatted date, or '' for none
 * @example formatDate('2026-10-18') // '10/18/2026' in en-US, wherever the reader is
 * @example formatDate(Date.now(), { month: 'short', day: 'numeric' }) // 'Oct 18'
 */
export const formatDate = (value, { locale, ...options } = {}) => {
	const date = parseDate(value);

	if (date) return date.toLocaleDateString(locale, options);

	return typeof value === 'string' ? value : '';
};

/**
 * Format a time of day for reading, in the reader's locale: hours and minutes unless told otherwise. Text that isn't a
 * date is returned as it was.
 * @param {Date|number|string} value - The time
 * @param {object} [options] - Intl.DateTimeFormat options, plus locale; `hour12: false` for a 24-hour clock
 * @param {string} [options.locale] - Defaults to the reader's
 * @returns {string} The formatted time, or '' for none
 * @example formatTime(new Date(2026, 9, 18, 18, 3)) // '6:03 PM' in en-US
 * @example formatTime(Date.now(), { hour12: false }) // '18:03'
 */
export const formatTime = (value, { locale, ...options } = {}) => {
	const date = parseDate(value);

	if (date) return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', ...options });

	return typeof value === 'string' ? value : '';
};

/**
 * A length of time, briefly, in hours and minutes: '1h 30m', '45m', '2h'. Less than a minute is ''.
 * @param {number} milliseconds - How long
 * @returns {string} The duration, or '' for none
 */
export const formatDuration = milliseconds => {
	const total = Math.floor((milliseconds || 0) / 60_000);
	const hours = Math.floor(total / 60);
	const minutes = total % 60;

	return [hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(' ');
};

/**
 * How many days a month has, leap years counted.
 * @param {number} year - The year
 * @param {number} month - The month, 0 for January as Date counts them
 * @returns {number} 28 to 31
 */
export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/**
 * How long ago (or how far ahead) a time is, briefly: 'just now', '5m ago', '3h ago', '2d ago', 'in 10m'.
 * @param {Date|number|string} value - The time
 * @param {number} [now] - The time to measure from
 * @returns {string} The relative time, or '' for none
 */
export const relativeTime = (value, now = Date.now()) => {
	const date = parseDate(value);

	if (!date) return '';

	const minutes = Math.round((now - date.getTime()) / 60_000);
	const span = Math.abs(minutes);

	if (span < 1) return 'just now';

	let amount = `${Math.round(span / 60 / 24)}d`;

	if (span < 60) amount = `${span}m`;
	else if (span < 60 * 24) amount = `${Math.round(span / 60)}h`;

	return minutes > 0 ? `${amount} ago` : `in ${amount}`;
};
