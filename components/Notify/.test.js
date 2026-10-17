import { findByText } from '@testing-library/dom';

import { Component } from '../..';

import { Notify } from '.';

describe('Notify', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Notify({ appendTo: container, append: new Component({ textContent }) });

		await findByText(container, textContent);
	});

	describe('timeout', () => {
		test('info and success dismiss themselves; warning and error wait to be tapped', () => {
			const timeouts = ['info', 'success', 'warning', 'error'].map(
				type => new Notify({ type, autoOpen: false, appendTo: container }).options.timeout,
			);

			expect(timeouts).toEqual([4000, 4000, 0, 0]);
		});

		test('a timeout given, zero included, wins', () => {
			expect(new Notify({ type: 'info', timeout: 0, autoOpen: false, appendTo: container }).options.timeout).toBe(0);
			expect(new Notify({ type: 'error', timeout: 9000, autoOpen: false, appendTo: container }).options.timeout).toBe(
				9000,
			);
		});
	});

	describe('placement', () => {
		const toast = textContent => {
			const notify = new Notify({ textContent, autoOpen: false, appendTo: container });

			notify.show();

			return notify;
		};

		test('toasts placed at no point stack in the corner, the newest at the bottom', () => {
			const older = toast('older');
			const newer = toast('newer');

			expect(older.elem).toHaveClass('stacked');
			expect(newer.elem.style.bottom).toBe('16px');
			expect(parseInt(older.elem.style.bottom)).toBeGreaterThan(16);

			newer.destroy();

			expect(older.elem.style.bottom).toBe('16px');
			older.destroy();
		});

		test('a toast placed at a point is not stacked', () => {
			const placed = new Notify({ x: 40, y: 40, autoOpen: false, appendTo: container });

			placed.show();

			expect(placed.elem).not.toHaveClass('stacked');
			placed.destroy();
		});
	});
});
