import { Component } from '../../Component';
import { styled } from '../../styled';

const FieldErrorMessage = styled(
	Component,
	({ colors, fontSize, space }) => `
		margin: ${space.xs} 0 0;
		color: ${colors.light(colors.danger)};
		font-size: ${fontSize.sm};
		white-space: pre-line;
	`,
);

/**
 * Runs a field's validators against a value. A validator is `value => message`: what's wrong, in words, or nothing
 * (null, undefined, false, '') when the value is fine. The same function checks a field on the server, as a
 * createStore field's `validate`.
 * @param {Function|Array<Function>} [validate] - One validator or several
 * @param {*} value - The value to check
 * @returns {Array<string>} What's wrong with it, empty when nothing is
 */
export const runValidators = (validate, value) =>
	[validate]
		.flat()
		.filter(check => typeof check === 'function')
		.map(check => check(value))
		.filter(Boolean)
		.map(String);

const describedBy = (field, id, on) => {
	const ids = new Set((field.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));

	if (on) ids.add(id);
	else ids.delete(id);

	if (ids.size) field.setAttribute('aria-describedby', [...ids].join(' '));
	else field.removeAttribute('aria-describedby');
};

/**
 * Shows what's wrong with a field, or clears it: the field is marked invalid (`aria-invalid`, the `validation-errors`
 * class), and the messages are written below it in the danger color, read out with the field (`aria-describedby`).
 * One display for every field: Input, Select, TagList, and whatever else a Form holds.
 * @param {object} options - Options
 * @param {Component} options.owner - The component the field belongs to; the message goes when it is destroyed
 * @param {HTMLElement} [options.field] - The element that takes focus, marked invalid; the owner's element by default
 * @param {HTMLElement} [options.after] - The element the message follows; the owner's element by default
 * @param {Array<string>} [options.messages] - What's wrong; none clears it
 */
export const showFieldError = ({ owner, field = owner.elem, after = owner.elem, messages = [] }) => {
	const invalid = messages.length > 0;
	let message = owner._fieldError;

	owner.elem.classList.toggle('validation-errors', invalid);
	if (field !== owner.elem) field.classList.toggle('validation-errors', invalid);

	if (invalid) field.setAttribute('aria-invalid', 'true');
	else field.removeAttribute('aria-invalid');

	if (!invalid) {
		if (message) describedBy(field, message.elem.id, false);
		message?.destroy();
		owner._fieldError = null;

		return;
	}

	if (!message) {
		message = owner._fieldError = new FieldErrorMessage({ addClass: 'vbc-field-error' });
		message.elem.id = `${owner.uniqueId}-error`;
		owner.replaceDestroyCleanup('fieldError', () => {
			owner._fieldError?.destroy();
			owner._fieldError = null;
		});
	}

	message.elem.textContent = messages.join('\n');
	describedBy(field, message.elem.id, true);

	if (after.parentElement && after.nextElementSibling !== message.elem) after.after(message.elem);
};
