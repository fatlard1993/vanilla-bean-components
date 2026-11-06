import { findByText } from '@testing-library/dom';

import { Button } from '../Button';
import { TooltipWrapper } from '.';

describe('TooltipWrapper', () => {
	test('must render', async () => {
		const tooltip = 'tooltip';

		new TooltipWrapper({ tooltip, appendTo: container });

		await findByText(container, tooltip);
	});

	test('a focused Button with a tooltip shows it, and hides it on blur', async () => {
		const button = new Button({ textContent: 'Save', tooltip: 'Saves the draft', appendTo: container });

		// The test setup's popover shim shows and hides through display
		const tooltip = await findByText(container, 'Saves the draft');
		expect(tooltip.style.display).not.toBe('block');

		button.elem.focus();
		expect(tooltip.style.display).toBe('block');

		button.elem.blur();
		expect(tooltip.style.display).toBe('none');
	});

	test('focus moving onto a wrapped child shows the tooltip', () => {
		const wrapper = new TooltipWrapper({ tooltip: 'Search', appendTo: container });
		const input = document.createElement('input');
		wrapper.elem.append(input);

		input.focus();
		expect(wrapper._tooltip.elem.style.display).toBe('block');
	});
});

describe('TooltipWrapper rendering again', () => {
	test('keeps its tooltip', async () => {
		const button = new Button({ textContent: 'b', tooltip: 'hint', appendTo: container });

		button.render();
		await new Promise(resolve => setTimeout(resolve, 0));

		// eslint-disable-next-line testing-library/no-node-access
		expect(button.elem.querySelectorAll('.tooltip')).toHaveLength(1);
		expect(button._tooltip.options.isDestroyed).toBe(false);
	});

	test('the pointer crossing into a child does not close it', () => {
		const wrapper = new TooltipWrapper({ tooltip: 'hint', appendTo: container }, new Button({ textContent: 'in' }));

		wrapper._tooltip.open({ x: 10, y: 10 });
		// eslint-disable-next-line testing-library/no-node-access
		wrapper.elem.querySelector('button').dispatchEvent(new Event('pointerout', { bubbles: true }));

		expect(wrapper._tooltip.isOpen).toBe(true);
	});
});
