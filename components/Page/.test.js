import { findByText } from '@testing-library/dom';

import { Component, appendStyles } from '../..';

import { Page } from '.';

describe('Page', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Page({ appendTo: container, append: new Component({ textContent }) });

		await findByText(container, textContent);
	});

	test('themeElements: false turns off the styles for bare elements, and true turns them back on', () => {
		// Page's element styles go in once the document has loaded, which a test run may not have reached; a <style> in
		// head has no role to query it by
		// eslint-disable-next-line testing-library/no-node-access
		const style = document.getElementById('vbc-theme-elements') ?? appendStyles('/* elements */', 'vbc-theme-elements');
		const page = new Page({ themeElements: false, autoRender: true, appendTo: container });

		expect(style.disabled).toBe(true);

		page.options.themeElements = true;

		expect(style.disabled).toBe(false);
	});
});
