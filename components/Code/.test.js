import { getByRole } from '@testing-library/dom';

import { Code } from '.';

describe('Code', () => {
	test('a line of code is an inline code element in its language', () => {
		const code = new Code({ code: 'const x = 1;', appendTo: container });

		expect(code.elem.tagName).toBe('CODE');
		expect(code.elem.textContent).toBe('const x = 1;');
		expect(code.elem).toHaveClass('language-javascript');
	});

	test('several lines are a block: a pre holding a code element', () => {
		const code = new Code({ code: 'a\nb', language: 'css', appendTo: container });

		expect(code.elem.tagName).toBe('PRE');
		expect(code._code.elem.tagName).toBe('CODE');
		expect(code._code.elem.textContent).toBe('a\nb');
		expect(code._code.elem).toHaveClass('language-css');
	});

	test('copyButton adds a button to copy with', () => {
		new Code({ code: 'a\nb', copyButton: true, appendTo: container });

		expect(getByRole(container, 'button', { name: 'Copy to clipboard' })).toBeDefined();
	});

	test('the code follows its option', () => {
		const code = new Code({ code: 'a\nb', appendTo: container });

		code.options.code = 'c\nd';

		expect(code._code.elem.textContent).toBe('c\nd');
	});
});
