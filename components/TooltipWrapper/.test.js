import { findByText } from '@testing-library/dom';

import { TooltipWrapper } from '.';

describe('TooltipWrapper', () => {
	test('must render', async () => {
		const tooltip = 'tooltip';

		new TooltipWrapper({ tooltip, appendTo: container });

		await findByText(container, tooltip);
	});
});
