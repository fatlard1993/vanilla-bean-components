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
	const date = dateOnly ? new Date(+dateOnly[1], dateOnly[2] - 1, +dateOnly[3]) : new Date(value);

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
