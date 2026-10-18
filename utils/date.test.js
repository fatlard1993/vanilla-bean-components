import { formatDate, parseDate, relativeTime } from './date';

describe('date', () => {
	const zone = process.env.TZ;

	// West of Greenwich, where reading 2026-10-18 as UTC midnight lands on the 17th
	beforeAll(() => {
		process.env.TZ = 'America/Chicago';
	});

	afterAll(() => {
		process.env.TZ = zone;
	});

	test('a date-only string is that day where the reader is', () => {
		const date = parseDate('2026-10-18');

		expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 18]);
		expect(formatDate('2026-10-18', { locale: 'en-US' })).toBe('10/18/2026');
	});

	test('a day the month lacks is no date, and an early year stays early', () => {
		expect(parseDate('2026-02-31')).toBe(null);
		expect(parseDate('2026-13-01')).toBe(null);
		expect(parseDate('2024-02-29').getDate()).toBe(29);
		expect(parseDate('0042-06-01').getFullYear()).toBe(42);
	});

	test('numbers, Dates and full ISO strings read as themselves', () => {
		const at = Date.UTC(2026, 9, 18, 18);

		expect(parseDate(at).getTime()).toBe(at);
		expect(parseDate(new Date(at)).getTime()).toBe(at);
		expect(parseDate('2026-10-18T18:00:00Z').getTime()).toBe(at);
		expect(formatDate(at, { locale: 'en-US', month: 'short', day: 'numeric' })).toBe('Oct 18');
	});

	test('nothing formats as nothing, and text that is not a date stays as written', () => {
		expect(parseDate('')).toBe(null);
		expect(parseDate('soon')).toBe(null);
		expect(formatDate(undefined)).toBe('');
		expect(formatDate('soon')).toBe('soon');
	});

	test('relativeTime: just now, minutes, hours, days, and ahead', () => {
		const now = Date.UTC(2026, 9, 18, 12);

		expect(relativeTime(now - 20_000, now)).toBe('just now');
		expect(relativeTime(now - 5 * 60_000, now)).toBe('5m ago');
		expect(relativeTime(now - 3 * 3_600_000, now)).toBe('3h ago');
		expect(relativeTime(now - 2 * 86_400_000, now)).toBe('2d ago');
		expect(relativeTime(now + 10 * 60_000, now)).toBe('in 10m');
		expect(relativeTime(null, now)).toBe('');
	});
});
