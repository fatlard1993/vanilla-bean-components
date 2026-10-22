import { findByText, getByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

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

		// The px part of a stacked toast's bottom, which also adds the app's offset and the home indicator
		const height = notify => Number(notify.elem.style.bottom.match(/(\d+)px/)?.[1]);

		test('toasts placed at no point stack in the corner, the newest at the bottom', () => {
			const older = toast('older');
			const newer = toast('newer');

			expect(older.elem).toHaveClass('stacked');
			expect(height(newer)).toBe(18);
			expect(height(older)).toBeGreaterThan(18);

			newer.destroy();

			expect(height(older)).toBe(18);
			older.destroy();
		});

		test('the stack sits above an app bar the app names in --vbc-notify-offset, and the home indicator', () => {
			const notify = toast('lifted');

			expect(notify.elem.style.bottom).toContain('var(--vbc-notify-offset, 0px)');
			expect(notify.elem.style.bottom).toContain('env(safe-area-inset-bottom');
			notify.destroy();
		});

		test('a toast placed at a point is not stacked', () => {
			const placed = new Notify({ x: 40, y: 40, autoOpen: false, appendTo: container });

			placed.show();

			expect(placed.elem).not.toHaveClass('stacked');
			placed.destroy();
		});
	});

	describe('actions', () => {
		const settle = (ms = 20) => new Promise(resolve => setTimeout(resolve, ms));

		test('show beside the message, which keeps its text', async () => {
			new Notify({ textContent: 'Deleted 3 bookmarks', actions: [{ textContent: 'Undo' }], appendTo: container });

			expect(await findByText(container, 'Deleted 3 bookmarks')).toBeInTheDocument();
			expect(getByRole(container, 'button', { name: 'Undo', hidden: true })).toBeInTheDocument();
		});

		test('an action runs, then the toast closes once it settles', async () => {
			let finish;
			const onPress = mock(() => new Promise(resolve => (finish = resolve)));
			const notify = new Notify({ content: 'm', actions: [{ textContent: 'Undo', onPress }], appendTo: container });
			const undo = getByRole(container, 'button', { name: 'Undo', hidden: true });

			await userEvent.setup().click(undo);
			await userEvent.setup().click(undo);

			expect(onPress).toHaveBeenCalledTimes(1);
			expect(onPress.mock.calls[0][0]).toBe(notify);
			expect(undo).toBeDisabled();
			expect(notify.elem.isConnected).toBe(true);

			finish();
			await settle();

			expect(notify.elem.isConnected).toBe(false);
		});

		test('an action returning false keeps the toast, with its actions ready again', async () => {
			const notify = new Notify({
				content: 'm',
				actions: [{ textContent: 'Retry', onPress: () => false }],
				appendTo: container,
			});
			const retry = getByRole(container, 'button', { name: 'Retry', hidden: true });

			await userEvent.setup().click(retry);
			await settle();

			expect(notify.elem.isConnected).toBe(true);
			expect(retry).not.toBeDisabled();
		});

		test('a pointer over the toast holds its timeout, and it leaves a while after the pointer does', async () => {
			const notify = new Notify({ content: 'm', timeout: 40, actions: [{ textContent: 'Undo' }], appendTo: container });

			notify.elem.dispatchEvent(new Event('pointerenter'));
			await settle(80);

			expect(notify.elem.isConnected).toBe(true);

			notify.elem.dispatchEvent(new Event('pointerleave'));
			await settle(80);

			expect(notify.elem.isConnected).toBe(true);
			notify.destroy();
		});

		test('an action still running keeps the toast up, though the pointer leaves', async () => {
			let finish;
			const notify = new Notify({
				content: 'm',
				timeout: 40,
				actions: [{ textContent: 'Undo', onPress: () => new Promise(resolve => (finish = resolve)) }],
				appendTo: container,
			});

			notify.elem.dispatchEvent(new Event('pointerenter'));
			await userEvent.setup().click(getByRole(container, 'button', { name: 'Undo', hidden: true }));
			notify.elem.dispatchEvent(new Event('pointerleave'));
			await settle(1700);

			expect(notify.elem.isConnected).toBe(true);

			finish();
			await settle();

			expect(notify.elem.isConnected).toBe(false);
		});

		test('focus inside holds it too', async () => {
			const notify = new Notify({ content: 'm', timeout: 40, actions: [{ textContent: 'Undo' }], appendTo: container });

			getByRole(container, 'button', { name: 'Undo', hidden: true }).focus();
			await settle(80);

			expect(notify.elem.isConnected).toBe(true);
			notify.destroy();
		});
	});
});
