import { Calendar } from '.';

describe('Calendar', () => {
	let calendar;

	afterEach(() => {
		calendar?.destroy?.();
		calendar = null;
		document.body.replaceChildren();
	});

	describe('toolbar view buttons', () => {
		test('the active view button is pressed on render', () => {
			calendar = new Calendar({ appendTo: document.body });

			expect(calendar.elem.querySelector('.set-month').classList.contains('pressed')).toBe(true);
			expect(calendar.elem.querySelector('.set-day').classList.contains('pressed')).toBe(false);
		});

		test('pressed state follows setView', () => {
			calendar = new Calendar({ appendTo: document.body });

			calendar.setView('day');

			expect(calendar.elem.querySelector('.set-day').classList.contains('pressed')).toBe(true);
			expect(calendar.elem.querySelector('.set-month').classList.contains('pressed')).toBe(false);

			calendar.setView('week');

			expect(calendar.elem.querySelector('.set-week').classList.contains('pressed')).toBe(true);
			expect(calendar.elem.querySelector('.set-day').classList.contains('pressed')).toBe(false);
		});

		test('a direct view option write renders the view and moves pressed state', () => {
			calendar = new Calendar({ appendTo: document.body });

			calendar.options.view = 'day';

			expect(calendar.elem.querySelector('.time-block')).toBeTruthy();
			expect(calendar.elem.querySelector('.set-day').classList.contains('pressed')).toBe(true);
		});

		test('a direct events option write renders the events', () => {
			calendar = new Calendar({ appendTo: document.body });

			calendar.options.events = [{ at: Date.now(), label: 'reactive event' }];

			expect(calendar.elem.querySelector('.event')).toBeTruthy();
			expect(calendar.options.events[0].label).toBe('reactive event');
		});

		test('pressed state survives a full re-render', () => {
			calendar = new Calendar({ appendTo: document.body });

			calendar.setView('week');
			calendar.next();

			expect(calendar.elem.querySelector('.set-week').classList.contains('pressed')).toBe(true);
			expect(calendar.elem.querySelector('.set-month').classList.contains('pressed')).toBe(false);
		});
	});
});
