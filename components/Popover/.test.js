import { findByText } from '@testing-library/dom';

import { Component } from '../..';

import { Popover } from '.';

describe('Popover', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Popover({ appendTo: container, append: new Component({ textContent }) });

		await findByText(container, textContent);
	});

	describe('open, close and the close event', () => {
		test('open and close it; isOpen says which, and close is announced once for each opening', () => {
			const onClose = mock();
			const popover = new Popover({ autoOpen: false, onClose, appendTo: container });

			popover.close();
			popover.open();

			expect(popover.isOpen).toBe(true);

			popover.close();
			popover.close();

			expect(popover.isOpen).toBe(false);
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		test('a close by the platform, a light dismiss, is announced too', () => {
			const onClose = mock();
			const popover = new Popover({ autoOpen: false, state: 'auto', onClose, appendTo: container });

			popover.open();
			popover.elem.dispatchEvent(Object.assign(new Event('toggle'), { newState: 'closed' }));

			expect(popover.isOpen).toBe(false);
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		test('a number for autoOpen is its delay', async () => {
			const popover = new Popover({ autoOpen: 10, appendTo: container });

			expect(popover.isOpen).toBe(false);

			await new Promise(resolve => setTimeout(resolve, 40));

			expect(popover.isOpen).toBe(true);
		});
	});

	describe('outsideClose', () => {
		const settle = () => new Promise(resolve => setTimeout(resolve, 40));
		const shown = popover => popover.elem.style.display === 'block';
		// The whole of a real press, not just its click
		const press = ({ elem }) => {
			elem.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			elem.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
			elem.click();
		};

		const setup = async () => {
			const popover = new Popover({ outsideClose: true, autoOpen: false, appendTo: container });
			const elsewhere = new Component({ tag: 'button', textContent: 'elsewhere', appendTo: container });

			popover.open();
			await settle();

			return { popover, elsewhere };
		};

		test('a press elsewhere hides it', async () => {
			const { popover, elsewhere } = await setup();

			press(elsewhere);
			await settle();

			expect(shown(popover)).toBe(false);
		});

		test('a press inside keeps it', async () => {
			const { popover } = await setup();
			const inside = new Component({ tag: 'button', appendTo: popover });

			press(inside);
			await settle();

			expect(shown(popover)).toBe(true);
		});

		test('a toggle outside it closes it, rather than closing and opening again', async () => {
			const { popover } = await setup();
			const toggle = new Component({
				tag: 'button',
				appendTo: container,
				onPointerPress: () => (shown(popover) ? popover.close() : popover.open()),
			});

			press(toggle);
			await settle();

			expect(shown(popover)).toBe(false);
		});

		test('a press that shows it somewhere new keeps it', async () => {
			const { popover } = await setup();
			const showElsewhere = new Component({
				tag: 'button',
				appendTo: container,
				onPointerPress: () => popover.open({ x: 20, y: 20 }),
			});

			press(showElsewhere);
			await settle();

			expect(shown(popover)).toBe(true);
		});
	});
});

describe('Popover placement', () => {
	// happy-dom lays nothing out: the viewport is given
	beforeEach(() => {
		document.documentElement.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1920, bottom: 1080 });
	});

	afterEach(() => {
		delete document.documentElement.getBoundingClientRect;
	});

	test('a point places it just below and right of the point, within its size limits', () => {
		const popover = new Popover({ x: 100, y: 200, autoOpen: false, appendTo: container });

		expect(popover.elem.style.left).toBe('112px');
		expect(popover.elem.style.top).toBe('212px');
		expect(popover.elem.style.maxWidth).toBe('264px');
		expect(popover.elem.style.maxHeight).toBe('132px');
	});

	test('its size limits are options', () => {
		const popover = new Popover({ x: 10, y: 10, maxWidth: 400, maxHeight: 300, autoOpen: false, appendTo: container });

		expect(popover.elem.style.maxWidth).toBe('400px');
		expect(popover.elem.style.maxHeight).toBe('300px');
	});

	test('past the right or bottom edge it is placed from that edge instead', () => {
		const right = new Popover({ x: 1900, y: 10, autoOpen: false, appendTo: container });
		const bottom = new Popover({ x: 10, y: 1070, autoOpen: false, appendTo: container });

		expect(right.elem.style.left).toBe('unset');
		expect(right.elem.style.right).toMatch(/px$/);
		expect(bottom.elem.style.top).toBe('unset');
		expect(bottom.elem.style.bottom).toMatch(/px$/);
	});

	test('a point off the viewport is brought onto it', () => {
		const popover = new Popover({ x: -500, y: -500, autoOpen: false, appendTo: container });

		expect(popover.elem.style.left).toBe('12px');
		expect(popover.elem.style.top).toBe('12px');
	});

	test('moving the point moves the popover', () => {
		const popover = new Popover({ x: 10, y: 10, autoOpen: false, appendTo: container });

		popover.options.x = 50;

		expect(popover.elem.style.left).toBe('62px');
	});
});

describe('Popover state', () => {
	test('state is the popover attribute: manual unless auto', () => {
		const manual = new Popover({ autoOpen: false, appendTo: container });
		const auto = new Popover({ state: 'auto', autoOpen: false, appendTo: container });

		expect(manual.elem.popover).toBe('manual');
		expect(auto.elem.popover).toBe('auto');
		expect(() => (manual.options.state = 'sometimes')).toThrow('not a valid state');
	});

	test('open() before it is in the document opens nothing', () => {
		const popover = new Popover({ autoOpen: false, appendTo: null });

		popover.open();

		expect(popover.isOpen).toBe(false);
	});

	test('destroy() closes it, announcing close once, and takes it out of the page', () => {
		const onClose = mock();
		const popover = new Popover({ autoOpen: false, onClose, appendTo: container });

		popover.open();
		popover.destroy();

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(popover.elem.isConnected).toBe(false);
	});
});
