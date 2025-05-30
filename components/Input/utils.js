import { Component } from '../../Component';
import { styled } from '../../styled';
import { getElementsContainingText } from '../../utils';
import { Button } from '../Button';
import { Popover } from '../Popover';

export const InputValidationError = styled(
	Component,
	({ colors }) => `
		background-color: ${colors.red};
		padding: 6px;
		margin: 3px;
		border-radius: 3px;
	`,
);

export const updateValidationErrors = ({ elem, validations, value }) => {
	if (!validations?.length) return;

	const errors = [];

	validations.forEach(([validation, message]) => {
		const isValid = validation instanceof RegExp ? validation.test(value) : validation(value);

		const resolvedMessage = typeof message == 'function' ? message(value) : message;

		const [existingValidationError] = getElementsContainingText(resolvedMessage, {
			xPathElement: 'div',
			scope: elem.parentElement,
			caseSensitive: true,
		});

		if (!isValid) errors.push(resolvedMessage);

		if (existingValidationError) {
			existingValidationError.style.display = isValid ? 'none' : 'block';
		} else if (!isValid) {
			const validationError = new InputValidationError({ content: resolvedMessage });
			const [inputLabel] = elem.parentElement.getElementsByTagName('label');

			if (inputLabel) {
				let errorPopover = elem.parentElement.querySelector('section');

				if (!errorPopover) {
					errorPopover = new Popover({ autoOpen: false, state: 'auto' });
					elem.parentElement.insertBefore(errorPopover.elem, elem);

					new Button({
						appendTo: inputLabel,
						icon: 'exclamation',
						styles: ({ colors }) => ({
							marginLeft: '6px',
							width: '18px',
							height: '18px',
							fontSize: '12px',
							padding: 0,
							backgroundColor: colors.red,
						}),
						onPointerPress: event => errorPopover.show({ x: event.clientX, y: event.clientY }),
					});
				}

				errorPopover.append(validationError.elem);
			}

			// Insert directly before the input element in case there are other stacked elements
			else elem.parentElement.insertBefore(validationError.elem, elem);
		}
	});

	return errors.length > 0 ? errors : undefined;
};

export const insertTabCharacter = input => {
	const { value, selectionEnd } = input;

	input.value = `${value.slice(0, Math.max(0, selectionEnd))}\t${value.slice(Math.max(0, selectionEnd))}`;
	input.selectionStart = input.selectionEnd = selectionEnd + 1;
};

export const adjustIndentation = ({ textarea, action = 'add' }) => {
	const { value, selectionStart, selectionEnd } = textarea;
	const remove = action === 'remove';

	const startLine = value.slice(0, Math.max(0, selectionStart)).split('\n').length - 1;
	const endLine = value.slice(0, Math.max(0, selectionEnd)).split('\n').length - 1;

	let modifiedStartLine = false;
	let modifiedLines = 0;

	const updateLine = (line, index) => {
		if (remove) {
			if (!/^\t/.test(line)) return line;

			++modifiedLines;
			if (index === startLine) modifiedStartLine = true;
			return line.replace(/^\t/, '');
		}

		++modifiedLines;
		if (index === startLine) modifiedStartLine = true;
		return `\t${line}`;
	};

	const newValue = value
		.split('\n')
		.map((line, index) => (index >= startLine && index <= endLine ? updateLine(line, index) : line))
		.join('\n');

	const changedText = value !== newValue;

	if (!changedText) {
		textarea.selectionStart = selectionStart;
		textarea.selectionEnd = selectionEnd;
		return;
	}

	textarea.value = newValue;

	const selectionModification = remove ? -1 : 1;

	textarea.selectionStart = selectionStart + (modifiedStartLine ? selectionModification : 0);
	textarea.selectionEnd = selectionEnd + modifiedLines * selectionModification;
};
