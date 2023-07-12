import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { TooltipSupport } from '.';

const container = new JSDOM().window.document.body;

describe('TooltipSupport', () => {
	test('must render', async () => {
		const tooltip = 'tooltip';

		new TooltipSupport({ tooltip, appendTo: container });

		await findByText(container, tooltip);
	});
});
