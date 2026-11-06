import { findByText } from '@testing-library/dom';

import { Tooltip } from '.';

describe('Tooltip', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Tooltip({ textContent, appendTo: container });

		await findByText(container, textContent);
	});
});

describe('Tooltip position', () => {
	// happy-dom lays nothing out: the parent's place on the screen and the tooltip's size are given
	const laidOut = (tooltip, parentRect, size) => {
		tooltip.elem.parentElement.getBoundingClientRect = () => parentRect;
		Object.defineProperty(tooltip.elem, 'offsetWidth', { value: size.width });
		Object.defineProperty(tooltip.elem, 'offsetHeight', { value: size.height });
	};
	const rect = { left: 300, top: 400, right: 400, bottom: 440, width: 100, height: 40 };

	afterEach(() => {
		delete container.getBoundingClientRect;
		delete document.documentElement.getBoundingClientRect;
	});

	test('each preset is measured out from the parent as it is on the screen, scrolled or not', () => {
		const placed = position => {
			const tooltip = new Tooltip({ textContent: 'tip', position, appendTo: container });

			laidOut(tooltip, rect, { width: 60, height: 20 });
			tooltip.open();

			return [tooltip.elem.style.left, tooltip.elem.style.top];
		};

		expect(placed('bottom')).toEqual(['320px', '442px']);
		expect(placed('top')).toEqual(['320px', '378px']);
		expect(placed('right')).toEqual(['402px', '410px']);
		expect(placed('left')).toEqual(['238px', '410px']);
		expect(placed('topRight')).toEqual(['391px', '389px']);
		expect(placed('bottomLeft')).toEqual(['249px', '431px']);
		expect(placed('center')).toEqual(['320px', '410px']);
	});

	test('a tooltip that would leave the screen is kept on it', () => {
		const tooltip = new Tooltip({ textContent: 'tip', position: 'top', appendTo: container });

		laidOut(tooltip, { left: 0, top: 0, right: 40, bottom: 10, width: 40, height: 10 }, { width: 100, height: 30 });
		tooltip.open();

		expect(tooltip.elem.style.left).toBe('4px');
		expect(tooltip.elem.style.top).toBe('4px');
	});

	test('opened at a point, it goes to the point', () => {
		const tooltip = new Tooltip({ textContent: 'tip', position: 'bottom', appendTo: container });

		// The viewport as laid out, so a point well inside it is not taken for one past its edges
		document.documentElement.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1920, bottom: 1080 });
		tooltip.open({ x: 10, y: 10 });

		expect(tooltip.elem.style.left).toBe('22px');
		expect(tooltip.elem.style.top).toBe('22px');
	});
});
