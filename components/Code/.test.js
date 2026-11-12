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

	test('with multiline auto, the element follows the code: inline becomes a block and back, in place', () => {
		const before = document.createElement('span');
		const after = document.createElement('span');
		container.append(before);
		const code = new Code({ code: 'one line', language: 'css', onPointerPress: mock(), appendTo: container });
		container.append(after);

		code.options.code = 'a\nb';

		expect(code.elem.tagName).toBe('PRE');
		expect(code._code.elem.tagName).toBe('CODE');
		expect(code._code.elem.textContent).toBe('a\nb');
		expect(code._code.elem).toHaveClass('language-css');
		// eslint-disable-next-line testing-library/no-node-access
		expect(code.elem.previousSibling).toBe(before);
		// eslint-disable-next-line testing-library/no-node-access
		expect(code.elem.nextSibling).toBe(after);
		expect(code.elem._component).toBe(code);

		code.elem.click();

		expect(code.options.onPointerPress).toHaveBeenCalledTimes(1);

		code.options.code = 'back to one';

		expect(code.elem.tagName).toBe('CODE');
		expect(code.elem.textContent).toBe('back to one');
		expect(code.elem).toHaveClass('language-css');
		// eslint-disable-next-line testing-library/no-node-access
		expect(code.elem.nextSibling).toBe(after);
		// eslint-disable-next-line testing-library/no-node-access
		expect(container.querySelectorAll('pre')).toHaveLength(0);
	});

	test('a multiline given outright holds whatever the code', () => {
		const code = new Code({ code: 'one line', multiline: true, appendTo: container });

		expect(code.elem.tagName).toBe('PRE');

		code.options.code = 'still one';

		expect(code.elem.tagName).toBe('PRE');
		expect(code._code.elem.textContent).toBe('still one');
	});
});
